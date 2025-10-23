import data from "../data/index.json" with { type: 'json' }
import { IdGet } from "./script"

const tiles = IdGet("tiles")
let available_info = data
for (let i = 0; i < 2; i++) {
	const info_number = Math.floor(Math.random() * available_info.length)
	const info_item = available_info[info_number]
	delete available_info[info_number]
	
	let new_tile = document.createElement("div");
	new_tile.classList = "card";
	new_tile.addEventListener("click", function() { window.location.href = info_item["Link"]})
	
	let image = document.createElement("img")
	image.src = info_item["Image"][Math.floor(Math.random() * info_item["Image"].length)]
	new_tile.appendChild(image)
	
	let title = document.createElement("h2")
	title.textContent = info_item["Name"]
	new_tile.appendChild(title)
	
	let text = document.createElement("t")
	text.textContent = info_item["Text"]
	new_tile.appendChild(text)
	
	tiles.appendChild(new_tile)
}