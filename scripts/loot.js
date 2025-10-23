import loot from "../data/loot.json" with { type: 'json' }
import base_monsters from "../data/monsters.json" with { type: 'json' }
import { inject, IdGet, foundIn, getMonster, sortDict } from "../scripts/script.js"
import { renderItem } from "../scripts/info.js"

let monsters = sortDict(inject(base_monsters, "monsters"))
const sorting_types = ["CR", "Type", "Size"]
for (let i = 0; i < sorting_types.length; i++) {
	let selector = IdGet(sorting_types[i].toLowerCase() + "_options")
	selector.addEventListener("change", function() { loadScrollbox() })
}
loadScrollbox()

function loadScrollbox() {
	let parameters = {}
	for (let i = 0; i < sorting_types.length; i++) {
		let selector = IdGet(sorting_types[i].toLowerCase() + "_options")
		parameters[sorting_types[i]] = selector.value
	};
	let parent = IdGet("monster_scroll")
	while (parent.firstChild) {
		parent.removeChild(parent.lastChild);
	};
	let valid_monsters = getMonster(monsters, parameters["CR"], parameters["CR"], parameters["Type"], parameters["Size"])
	for (let i = 0; i < valid_monsters.length; i++) {
		renderItem(parent, valid_monsters[i], 1, "", valid_monsters[i], function(param) { console.log(param) })
	}
}

const substring = window.location.search.substring(1).split('=')
let info_source
if (substring[0] == "loot") {
	info_source = substring[1].replaceAll("%20", " ")
	if (foundIn(",", info_source)) {
		info_source = info_source.split(",")
	}
} else {
	info_source = []
}
console.log(info_source)