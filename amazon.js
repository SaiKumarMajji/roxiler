const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 5000;

// const THIRD_PARTY_API_URL = 'https://s3.amazonaws.com/roxiler.com/product_transaction.json';

// Function to fetch data from the third-party API
async function fetchData() {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    return response.data;
  } catch (error) {
    console.error('Error fetching data from the third-party API:', error.message);
    return null;
  }
}

// Initialize the database with seed data from the third-party API
let database = null;
fetchData().then((data) => {
  if (data) {
    database = data;
    console.log('Database has been initialized');
  }
});

// API to get total sale amount of selected month
app.get('/api/total-sale-amount', (req, res) => {
    const { month } = req.query;
    const transactions = getTransactionsForMonth(parseInt(month));
  
    // Calculate total sale amount for the selected month
    const totalSaleAmount = transactions.reduce((total, transaction) => {
      return total + transaction.price;
    }, 0);
  
    res.json({ totalSaleAmount });
});

// API to get total number of sold items of selected month
app.get('/api/total-sold-items', (req, res) => {
    const { month } = req.query;
    const transactions = getTransactionsForMonth(parseInt(month));
  
    // Calculate total number of sold items for the selected month
    const totalSoldItems = transactions.reduce((count, transaction) => {
      return count + (transaction.sold ? 1 : 0);
    }, 0);
  
    res.json({ totalSoldItems });
});

// API to get total number of not sold items of selected month
app.get('/api/total-not-sold-items', (req, res) => {
    const { month } = req.query;
    const transactions = getTransactionsForMonth(parseInt(month));
  
    // Calculate total number of not sold items for the selected month
    const totalNotSoldItems = transactions.reduce((count, transaction) => {
      return count + (transaction.sold ? 0 : 1);
    }, 0);
  
    res.json({ totalNotSoldItems });
});

// API to get data for bar chart
app.get('/api/bar-chart-data', (req, res) => {
    const { month } = req.query;
    const transactions = getTransactionsForMonth(parseInt(month));
  
    // Define the price ranges and initialize their counts to zero
    const priceRanges = [
      { range: '0 - 100', noOfItems: 0 },
      { range: '101 - 200', noOfItems: 0 },
      { range: '201 - 300', noOfItems: 0 },
      { range: '301 - 400', noOfItems: 0 },
      { range: '401 - 500', noOfItems: 0 },
      { range: '501 - 600', noOfItems: 0 },
      { range: '601 - 700', noOfItems: 0 },
      { range: '701 - 800', noOfItems: 0 },
      { range: '801 - 900', noOfItems: 0 },
      { range: '901 - above', noOfItems: 0 },
    ];
  
    // Calculate data for the bar chart
    transactions.forEach((transaction) => {
      const price = transaction.price;
      if (price >= 0 && price <= 100) {
        priceRanges[0].noOfItems++;
      } else if (price >= 101 && price <= 200) {
        priceRanges[1].noOfItems++;
      } else if (price >= 201 && price <= 300) {
        priceRanges[2].noOfItems++;
      } else if (price >= 301 && price <= 400) {
        priceRanges[3].noOfItems++;
      } else if (price >= 401 && price <= 500) {
        priceRanges[4].noOfItems++;
      } else if (price >= 501 && price <= 600) {
        priceRanges[5].noOfItems++;
      } else if (price >= 601 && price <= 700) {
        priceRanges[6].noOfItems++;
      } else if (price >= 701 && price <= 800) {
        priceRanges[7].noOfItems++;
      } else if (price >= 801 && price <= 900) {
        priceRanges[8].noOfItems++;
      } else {
        priceRanges[9].noOfItems++;
      }
    });
  
    res.json({ barChartData: priceRanges });
});

// API to get data for pie chart
app.get('/api/pie-chart-data', (req, res) => {
    const { month } = req.query;
    const transactions = getTransactionsForMonth(parseInt(month));
  
    // Calculate data for the pie chart
    const categories = {};
    transactions.forEach((transaction) => {
      const category = transaction.category;
      if (categories[category]) {
        categories[category]++;
      } else {
        categories[category] = 1;
      }
    });
  
    const pieChartData = Object.entries(categories).map(([category, count]) => ({
      category,
      count,
    }));
  
    res.json({ pieChartData });
});

// API to fetch combined data from all APIs
app.get('/api/combined-data', async (req, res) => {
  const { month } = req.query;
  const totalSaleAmount = await getTotalSaleAmount(month);
  const totalSoldItems = await getTotalSoldItems(month);
  const totalNotSoldItems = await getTotalNotSoldItems(month);
  const barChartData = await getBarChartData(month);
  const pieChartData = await getPieChartData(month);

  const combinedData = {
    totalSaleAmount,
    totalSoldItems,
    totalNotSoldItems,
    barChartData,
    pieChartData,
  };

  res.json(combinedData);
});

// Helper functions for calculating data 

function getTransactionsForMonth(month) {
    // Filter transactions for the selected month
    return database.filter((transaction) => {
      const transactionMonth = new Date(transaction.dateOfSale).getMonth();
      return transactionMonth === month;
    });
  }

async function getTotalSaleAmount(month) {
    const transactions = getTransactionsForMonth(month);

    // Calculate total sale amount for the selected month
    const totalSaleAmount = transactions.reduce((total, transaction) => {
      return total + transaction.price;
    }, 0);
  
    return totalSaleAmount;
}

async function getTotalSoldItems(month) {
    const transactions = getTransactionsForMonth(month);

    // Calculate total number of sold items for the selected month
    const totalSoldItems = transactions.reduce((count, transaction) => {
      return count + (transaction.sold ? 1 : 0);
    }, 0);
  
    return totalSoldItems;
}

async function getTotalNotSoldItems(month) {
    const transactions = getTransactionsForMonth(month);

    // Calculate total number of not sold items for the selected month
    const totalNotSoldItems = transactions.reduce((count, transaction) => {
      return count + (transaction.sold ? 0 : 1);
    }, 0);
  
    return totalNotSoldItems;
}

async function getBarChartData(month) {
    const transactions = getTransactionsForMonth(month);

    // Define the price ranges and initialize their counts to zero
    const priceRanges = [
      { range: '0 - 100', noOfItems: 0 },
      { range: '101 - 200', noOfItems: 0 },
      { range: '201 - 300', noOfItems: 0 },
      { range: '301 - 400', noOfItems: 0 },
      { range: '401 - 500', noOfItems: 0 },
      { range: '501 - 600', noOfItems: 0 },
      { range: '601 - 700', noOfItems: 0 },
      { range: '701 - 800', noOfItems: 0 },
      { range: '801 - 900', noOfItems: 0 },
      { range: '901 - above', noOfItems: 0 },
    ];
  
    // Calculate data for the bar chart
    transactions.forEach((transaction) => {
      const price = transaction.price;
      if (price >= 0 && price <= 100) {
        priceRanges[0].noOfItems++;
      } else if (price >= 101 && price <= 200) {
        priceRanges[1].noOfItems++;
      } else if (price >= 201 && price <= 300) {
        priceRanges[2].noOfItems++;
      } else if (price >= 301 && price <= 400) {
        priceRanges[3].noOfItems++;
      } else if (price >= 401 && price <= 500) {
        priceRanges[4].noOfItems++;
      } else if (price >= 501 && price <= 600) {
        priceRanges[5].noOfItems++;
      } else if (price >= 601 && price <= 700) {
        priceRanges[6].noOfItems++;
      } else if (price >= 701 && price <= 800) {
        priceRanges[7].noOfItems++;
      } else if (price >= 801 && price <= 900) {
        priceRanges[8].noOfItems++;
      } else {
        priceRanges[9].noOfItems++;
      }
    });
  
    return priceRanges;
}

async function getPieChartData(month) {
    const transactions = getTransactionsForMonth(month);

    // Calculate data for the pie chart
    const categories = {};
    transactions.forEach((transaction) => {
      const category = transaction.category;
      if (categories[category]) {
        categories[category]++;
      } else {
        categories[category] = 1;
      }
    });
  
    const pieChartData = Object.entries(categories).map(([category, count]) => ({
      category,
      count,
    }));
  
    return pieChartData;
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
