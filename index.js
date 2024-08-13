const { ethers } = require('ethers');
require('dotenv').config();

// Создаем новый кошелек
const newWallet = ethers.Wallet.createRandom();
console.log("Новый Address:", newWallet.address);
console.log("Новый Private Key:", newWallet.privateKey);

// Подключаемся к Ethereum с использованием Infura и существующего кошелька
const provider = new ethers.getDefaultProvider('mainnet', {
    infura: process.env.INFURA_PROJECT_ID
});
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

console.log('Подключено к Ethereum с использованием Infura');

// Добавьте правильный ABI для Uniswap и Sushiswap
const UNISWAP_ROUTER_ABI = require('./uniswapABI.json'); // Убедитесь, что ABI правильный
const SUSHISWAP_ROUTER_ABI = require('./sushiswapABI.json'); // Убедитесь, что ABI правильный

// Определите контракты
const uniswapRouter = new ethers.Contract(
    process.env.UNISWAP_ROUTER_ADDRESS,
    UNISWAP_ROUTER_ABI,
    wallet
);
const sushiswapRouter = new ethers.Contract(
    process.env.SUSHISWAP_ROUTER_ADDRESS,
    SUSHISWAP_ROUTER_ABI,
    wallet
);

// Адреса токенов
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';  // WETH token address
const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';  // DAI token address

async function getPrices() {
    const amountIn = ethers.utils.parseUnits('1', 18);  // 1 WETH

    const uniswapPrice = await uniswapRouter.getAmountsOut(amountIn, [WETH, DAI]);
    const sushiswapPrice = await sushiswapRouter.getAmountsOut(amountIn, [WETH, DAI]);

    return {
        uniswapPrice: uniswapPrice[1],
        sushiswapPrice: sushiswapPrice[1],
    };
}

async function executeArbitrage() {
    const { uniswapPrice, sushiswapPrice } = await getPrices();

    console.log(`Uniswap price: ${ethers.utils.formatEther(uniswapPrice)}, Sushiswap price: ${ethers.utils.formatEther(sushiswapPrice)}`);

    if (uniswapPrice.gt(sushiswapPrice)) {
        console.log('Арбитраж: покупка на Sushiswap и продажа на Uniswap');
        // Логика покупки на Sushiswap и продажи на Uniswap
    } else if (sushiswapPrice.gt(uniswapPrice)) {
        console.log('Арбитраж: покупка на Uniswap и продажа на Sushiswap');
        // Логика покупки на Uniswap и продажи на Sushiswap
    } else {
        console.log('Нет арбитражных возможностей');
    }
}

// Тестирование получения цен с Uniswap и Sushiswap
getPrices().then(prices => {
    console.log("Цены с Uniswap и Sushiswap:", prices);
}).catch(error => {
    console.error("Ошибка при получении цен:", error);
});

// Запускаем арбитраж каждую минуту
setInterval(executeArbitrage, 60000);
