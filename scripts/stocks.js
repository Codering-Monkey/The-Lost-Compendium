// original tries using for trade groups, swap these for like company stocks when you get around to it

import stocks from "../data/stocks.json" with { type: 'json' };
import { IdGet, lineBreak, foundIn } from "../scripts/script.js"

const stockPause = "000000"
let intPause = parseInt("1" + stockPause)

const time = (parseInt(new Date().getTime().toString().slice(0, stockPause.length * -1) + stockPause))

function randomNumber(seed = new Date().getTime(), a) {
  let random

  const m = 2 ** 32
  const c = 12345

  random = ((a * seed + c) % m) / m
  return random
}

if (!localStorage.getItem("Stocks")) {
	localStorage.setItem("Stocks", JSON.stringify({
		"Timestamp": 1760929000000,
		"Stocks": stocks["StockBase"]
	}))
}

let lastStocks = JSON.parse(localStorage.getItem("Stocks"))
if (lastStocks["Timestamp"] < time) {
	while (lastStocks["Timestamp"] != time) {
		Object.keys(lastStocks["Stocks"]).forEach((key) => {
			const upRandom = randomNumber(lastStocks["Timestamp"], stocks["StockUpC"][key]) + 0.5
			const downRandom = randomNumber(lastStocks["Timestamp"], stocks["StockDownC"][key]) + 0.5
			const increase = parseFloat(upRandom * stocks["StockChange"][key])
			const decrease = parseFloat(downRandom * stocks["StockChange"][key])
			const change = increase - decrease
			lastStocks["Stocks"][key].push(change + lastStocks["Stocks"][key].at(-1))
		})
		
		lastStocks["Timestamp"] += intPause
	}
	console.log(lastStocks["Stocks"])
	Object.keys(lastStocks["Stocks"]).forEach((key) => {
		lastStocks["Stocks"][key] = lastStocks["Stocks"][key].slice(-5)
	})
}
localStorage.setItem("Stocks", JSON.stringify(lastStocks))

parent = IdGet("stocks")
for (let i = 0; i < stocks["StockCatagories"].length; i++) {
	let title = document.createElement("h1")
	title.textContent = stocks["StockCatagories"][i]["Name"]
	parent.appendChild(title)
	Object.entries(stocks["StockCatagories"][i]["Stocks"]).forEach(([key, value]) => {
		let card = document.createElement("div")
		card.classList.add("plate")
		
		let titleCard = document.createElement("div")
		titleCard.classList.add("nameplate")
		let cardTitle = document.createElement("h2")
		cardTitle.textContent = key
		titleCard.appendChild(cardTitle)
		card.appendChild(titleCard)
		
		let bodyCard = document.createElement("div")
		bodyCard.classList.add("textplate")
		lineBreak(bodyCard)
		let cardBody = document.createElement("h1")
		let price
		if (!foundIn(key, stocks["Static"])) {
			price = (((lastStocks["Stocks"][key].at(-1) / stocks["StockBase"][key]) * stocks["StockPricePerBase"][key]) / stocks["StockBase"][key]).toFixed(2)
		} else {
			price = stocks["StockBasePrice"][key]
		}
		if (price > stocks["StockBasePrice"][key]) {
			cardBody.style.color = "var(--shadow)"
			price = "↑ " + price
		} else if (price < stocks["StockBasePrice"][key]) {
			cardBody.style.color = "var(--contrast)"
			price = "↓ " + price
		}
		cardBody.textContent = price + "gp / " + value
		bodyCard.appendChild(cardBody)
		lineBreak(bodyCard)
		card.appendChild(bodyCard)
		
		let volumeText = document.createElement("h2")
	    let volume
		if ((value == "kg") || (value == "m2")) {
			volume = "Volume: " + lastStocks["Stocks"][key].at(-1).toFixed(2) + " " + value
		} else {
			volume = "Volume: " + lastStocks["Stocks"][key].at(-1).toFixed(0) + " " + value + "s"
		}
		volumeText.textContent = volume
		bodyCard.appendChild(volumeText)
		
		parent.appendChild(card)
	})
}

