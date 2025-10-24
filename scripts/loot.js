import loot from "../data/loot.json" with { type: 'json' }
import { foundIn, monsterBar } from "../scripts/script.js"

let monster = monsterBar(function(param) { console.log(param) })

const substring = window.location.search.substring(1).split('=')
let info_source
if (substring[0] === "loot") {
	info_source = substring[1].replaceAll("%20", " ")
	if (foundIn(",", info_source)) {
		info_source = info_source.split(",")
	}
} else {
	info_source = []
}
console.log(info_source)