const FINNHUB_API_KEY = 'crjpakpr01qnnbrso6l0crjpakpr01qnnbrso6lg';
const COINGECKO_API_KEY = 'CG-ycP7djd2AtjxSRKu6jWWoLpr';

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName + 'Tab').classList.add('active');
    document.querySelector(`.tab:nth-child(${tabName === 'stocks' ? 1 : 2})`).classList.add('active');
}

async function fetchData(url, useCoingecko = false) {
    try {
        const headers = useCoingecko ? { 'x-cg-demo-api-key': COINGECKO_API_KEY } : {};
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched data:', data);
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

async function getStockInfo() {
    const symbol = document.getElementById('symbolInput').value.toUpperCase();
    const resultDiv = document.getElementById('result');
    const secFilingsDiv = document.getElementById('secFilings');
    const companyNewsDiv = document.getElementById('companyNews');
    
    resultDiv.innerHTML = 'LOADING...';
    secFilingsDiv.innerHTML = '';
    companyNewsDiv.innerHTML = '';

    try {
        const [profileData, quoteData, filingsData, newsData] = await Promise.all([
            fetchData(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`),
            fetchData(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`),
            fetchData(`https://finnhub.io/api/v1/stock/filings?symbol=${symbol}&token=${FINNHUB_API_KEY}`),
            fetchData(`https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${getDateString(30)}&to=${getDateString(0)}&token=${FINNHUB_API_KEY}`)
        ]);

        displayStockInfo(profileData, quoteData, filingsData, newsData);

    } catch (error) {
        resultDiv.innerHTML = `ERROR: ${error.message}. PLEASE TRY AGAIN LATER.`;
        console.error('Detailed error:', error);
    }
}

async function getCryptoInfo() {
    const symbol = document.getElementById('cryptoInput').value.toUpperCase();
    const resultDiv = document.getElementById('cryptoResult');
    const cryptoNewsDiv = document.getElementById('cryptoNews');
    
    resultDiv.innerHTML = 'LOADING...';
    cryptoNewsDiv.innerHTML = '';

    try {
        // First, search for the coin using the symbol
        const searchResult = await fetchData(`https://api.coingecko.com/api/v3/search?query=${symbol}`, true);
        if (!searchResult || !searchResult.coins || searchResult.coins.length === 0) {
            throw new Error('Cryptocurrency not found');
        }

        // Find the coin with the matching symbol
        const coin = searchResult.coins.find(c => c.symbol.toUpperCase() === symbol);
        if (!coin) {
            throw new Error('Cryptocurrency not found');
        }

        // Fetch detailed coin data and market chart using the coin ID
        const [coinData, marketData] = await Promise.all([
            fetchData(`https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`, true),
            fetchData(`https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=1`, true)
        ]);

        displayCryptoInfo(coinData, marketData);

    } catch (error) {
        resultDiv.innerHTML = `ERROR: ${error.message}. PLEASE TRY AGAIN LATER.`;
        console.error('Detailed error:', error);
    }
}

function getDateString(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
}

function displayStockInfo(profileData, quoteData, filingsData, newsData) {
    const resultDiv = document.getElementById('result');
    const secFilingsDiv = document.getElementById('secFilings');
    const companyNewsDiv = document.getElementById('companyNews');

    const companyName = profileData?.name || 'COMPANY NAME NOT AVAILABLE';
    const currentPrice = quoteData?.c ? `$${quoteData.c.toFixed(2)}` : 'PRICE NOT AVAILABLE';
    const change = quoteData?.d != null ? quoteData.d.toFixed(2) : 'N/A';
    const percentChange = quoteData?.dp != null ? quoteData.dp.toFixed(2) : 'N/A';

    resultDiv.innerHTML = `
        <h2>${companyName}</h2>
        <p>CURRENT PRICE: ${currentPrice}</p>
        <p>CHANGE: ${change} (${percentChange}%)</p>
        <p>SECTOR: ${profileData?.finnhubIndustry || 'N/A'}</p>
    `;

    secFilingsDiv.innerHTML = '<h2>RECENT SEC FILINGS</h2>';
    if (filingsData && filingsData.length > 0) {
        filingsData.slice(0, 5).forEach(filing => {
            secFilingsDiv.innerHTML += createFilingItem(filing);
        });
    } else {
        secFilingsDiv.innerHTML += '<p>NO SEC FILINGS AVAILABLE.</p>';
    }

    companyNewsDiv.innerHTML = '<h2>LATEST COMPANY NEWS</h2>';
    if (newsData && newsData.length > 0) {
        newsData.slice(0, 5).forEach(news => {
            companyNewsDiv.innerHTML += createNewsItem(news);
        });
    } else {
        companyNewsDiv.innerHTML += '<p>NO RECENT NEWS AVAILABLE.</p>';
    }
}

function displayCryptoInfo(coinData, marketData) {
    const resultDiv = document.getElementById('cryptoResult');

    if (!coinData || !coinData.market_data) {
        resultDiv.innerHTML = '<p>Error: Unable to fetch cryptocurrency data.</p>';
        return;
    }

    const currentPrice = coinData.market_data.current_price?.usd ? `$${coinData.market_data.current_price.usd.toFixed(2)}` : 'PRICE NOT AVAILABLE';
    const change24h = coinData.market_data.price_change_24h ? coinData.market_data.price_change_24h.toFixed(2) : 'N/A';
    const percentChange24h = coinData.market_data.price_change_percentage_24h ? coinData.market_data.price_change_percentage_24h.toFixed(2) : 'N/A';

    resultDiv.innerHTML = `
        <h2>${coinData.name} (${coinData.symbol.toUpperCase()})</h2>
        <p>CURRENT PRICE: ${currentPrice}</p>
        <p>24H CHANGE: $${change24h} (${percentChange24h}%)</p>
        <p>MARKET CAP: $${coinData.market_data.market_cap?.usd.toLocaleString() || 'N/A'}</p>
        <p>24H TRADING VOLUME: $${coinData.market_data.total_volume?.usd.toLocaleString() || 'N/A'}</p>
    `;

    // Add chart data if available
    if (marketData && marketData.prices) {
        const chartData = marketData.prices.map(([timestamp, price]) => ({
            date: new Date(timestamp),
            price: price
        }));
        createPriceChart(chartData, coinData.name);
    }
}

function createPriceChart(data, coinName) {
    const chartContainer = document.getElementById('cryptoResult');
    const containerWidth = chartContainer.offsetWidth;
    const margin = {top: 20, right: 20, bottom: 30, left: 50};
    const width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    d3.select("#cryptoResult svg").remove();

    const svg = d3.select("#cryptoResult")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([d3.min(data, d => d.price), d3.max(data, d => d.price)])
        .range([height, 0]);

    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.price));

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(`${coinName} Price (Last 24 Hours)`);
}

async function createMarketHeatmap() {
    const heatmapContainer = document.getElementById('heatmapContainer');
    heatmapContainer.innerHTML = 'LOADING MARKET HEATMAP...';

    try {
        const symbols = ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'FB', 'TSLA', 'BRK.B', 'NVDA', 'JPM', 'JNJ', 'V', 'PG', 'UNH', 'HD', 'BAC', 'MA', 'DIS', 'ADBE', 'CRM', 'NFLX'];
        const stocksData = await Promise.all(symbols.map(async (symbol) => {
            const quoteData = await fetchData(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
            return {
                symbol: symbol,
                price: quoteData?.c || 0,
                change: quoteData?.d || 0,
                percentChange: quoteData?.dp || 0
            };
        }));

        createHeatmap(stocksData.filter(stock => stock.price > 0), 'heatmapContainer');

    } catch (error) {
        heatmapContainer.innerHTML = `ERROR LOADING HEATMAP: ${error.message}`;
        console.error('Heatmap error:', error);
    }
}

async function createCryptoHeatmap() {
    const cryptoHeatmapContainer = document.getElementById('cryptoHeatmapContainer');
    cryptoHeatmapContainer.innerHTML = 'LOADING CRYPTO HEATMAP...';

    try {
        const coinsData = await fetchData('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false', true);
        
        const cryptoData = coinsData.map(coin => ({
            symbol: coin.symbol.toUpperCase(),
            price: coin.current_price,
            change: coin.price_change_24h,
            percentChange: coin.price_change_percentage_24h
        }));

        createHeatmap(cryptoData, 'cryptoHeatmapContainer');

    } catch (error) {
        cryptoHeatmapContainer.innerHTML = `ERROR LOADING CRYPTO HEATMAP: ${error.message}`;
        console.error('Crypto Heatmap error:', error);
    }
}

function createHeatmap(data, containerId) {
    const container = document.getElementById(containerId);
    const containerWidth = container.offsetWidth;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = containerWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    d3.select(`#${containerId}`).selectAll("*").remove();

    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const treemapLayout = d3.treemap()
        .size([width, height])
        .padding(1);

    const root = d3.hierarchy({ children: data })
        .sum(d => Math.abs(d.percentChange));

    treemapLayout(root);

    const colorScale = d3.scaleLinear()
        .domain([-5, 0, 5])
        .range(["#ff4136", "#ffffff", "#2ecc40"]);

    const cells = svg.selectAll("g")
        .data(root.leaves())
        .enter().append("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    cells.append("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => colorScale(d.data.percentChange));

    cells.append("text")
        .attr("class", "heatmap-label")
        .attr("x", d => (d.x1 - d.x0) / 2)
        .attr("y", d => (d.y1 - d.y0) / 2)
        .text(d => `${d.data.symbol}\n$${d.data.price.toFixed(2)}\n${d.data.percentChange.toFixed(2)}%`)
        .call(wrap, d => d.x1 - d.x0);
}

function createFilingItem(filing) {
    const secUrl = filing.accessNumber ? 
        `https://www.sec.gov/Archives/edgar/data/${filing.cik}/${filing.accessNumber.replace(/-/g, '')}/${filing.accessNumber}-index.htm` :
        '#';
    return `
        <div class="filing-item">
            <h3>${filing.form || 'N/A'}</h3>
            <p>FILED ON: ${filing.filedDate ? new Date(filing.filedDate).toLocaleDateString() : 'N/A'}</p>
            <a href="${secUrl}" target="_blank">VIEW FILING</a>
        </div>
    `;
}

function createNewsItem(news) {
    return `
        <div class="news-item">
            <h3><a href="${news.url || '#'}" target="_blank">${news.headline || 'N/A'}</a></h3>
            <p>${news.summary || 'No summary available.'}</p>
            <p>SOURCE: ${news.source || 'N/A'} | ${news.datetime ? new Date(news.datetime * 1000).toLocaleDateString() : 'N/A'}</p>
        </div>
    `;
}

function wrap(text, width) {
    text.each(function() {
        let text = d3.select(this),
            words = text.text().split(/\n/),
            lineHeight = 1.1,
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy") || 0);

        text.text(null);

        words.forEach((word, i) => {
            text.append("tspan")
                .attr("x", text.attr("x"))
                .attr("y", y)
                .attr("dy", `${i * lineHeight + dy}em`)
                .text(word);
        });
    });
}

// Initialize the heatmaps on page load
window.addEventListener('load', () => {
    createMarketHeatmap();
    createCryptoHeatmap();
});

// Redraw heatmaps on window resize
window.addEventListener('resize', () => {
    createMarketHeatmap();
    createCryptoHeatmap();
});
