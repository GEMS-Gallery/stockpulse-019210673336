import { backend } from 'declarations/backend';

document.addEventListener('DOMContentLoaded', async () => {
    const addStockForm = document.getElementById('addStockForm');
    const updatePricesButton = document.getElementById('updatePrices');
    const stockList = document.getElementById('stockList');

    addStockForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const symbol = document.getElementById('symbol').value;
        const name = document.getElementById('name').value;
        const price = parseFloat(document.getElementById('price').value);

        await backend.addStock(symbol, name, price);
        addStockForm.reset();
        await updateStockList();
    });

    updatePricesButton.addEventListener('click', async () => {
        const stocks = await backend.getAllStocks();
        for (const stock of stocks) {
            const newPrice = stock.price + (Math.random() - 0.5) * 2; // Simulate price change
            await backend.updateStockPrice(stock.symbol, newPrice);
        }
        await updateStockList();
    });

    async function updateStockList() {
        const stocks = await backend.getAllStocks();
        stockList.innerHTML = '';
        stocks.forEach(stock => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${stock.symbol}</td>
                <td>${stock.name}</td>
                <td>$${stock.price.toFixed(2)}</td>
            `;
            stockList.appendChild(row);
        });
    }

    // Initial stock list update
    await updateStockList();
});
