const express = require('express');
const payrollRoutes = require('./routes/payroll');

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api', payrollRoutes);

app.get('/', (req, res) => {
  res.send('SmartHR API is running');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});