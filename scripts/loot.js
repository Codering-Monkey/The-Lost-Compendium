import loot from "../data/loot.json" with { type: 'json' }
import {foundIn, monsterBar, setJSON, getJSON, IdGet, clear, capitalise, diceCalc} from "../scripts/script.js"

let monster = monsterBar(function(param) { addMonster(param) })

function addMonster(name) {
    let old = getJSON("Loot")
    name = capitalise(name)
    if (name in old) {
        old[name] += 1
    } else {
        old[name] = 1
    }
    setJSON("Loot", old)
    loadTiles()
}

const substring = window.location.search.substring(1).split('=')
let info_source
if (substring[0] === "loot") {
	info_source = substring[1].replaceAll("%20", " ")
	if (foundIn(",", info_source)) {
		const values = info_source.split(",")
        info_source = {}
        for (let i = 0; i < values.length; i++) {
            if (values[i] in info_source) {
                info_source[capitalise(values[i], true)] += 1
            } else {
                info_source[capitalise(values[i], true)] = 1
            }
        }
	} else {
        info_source[capitalise(info_source, true)] = 1
    }
} else {
	info_source = {}
}
setJSON("Loot", info_source)

function loadTiles() {
    const tiles = getJSON("Loot")
    let parent = IdGet("tiles")
    clear(parent)
    Object.entries(tiles).forEach(([key, value]) => {
        let plate = document.createElement("div")
        plate.classList.add("plate")
        plate.classList.add("hover-shadow")
        plate.addEventListener("click", function() {
            let name = this.children[0].textContent
            if (foundIn("x ", name)) {
                name = name.split("x ")[1]
            }
            tiles[name] -= 1
            if (tiles[name] === 0) {
                delete tiles[name]
            }
            setJSON("Loot", tiles)
            loadTiles()
        })
        parent.appendChild(plate)

        let nameplate = document.createElement("div")
        nameplate.classList.add("nameplate")
        if (value > 1) {
            nameplate.textContent = value + "x " + key
        } else {
            nameplate.textContent = key
        }
        plate.appendChild(nameplate)

        let textplate = document.createElement("div")
        textplate.classList.add("textplate")
        plate.appendChild(textplate)

        let monetaryValue = 0
        const cr = parseFloat(monster[key]["CR"])
        let dice
        if (cr in loot["Value"]) {
            dice = loot["Value"][cr]
        } else {
            dice = [2, 8, 10**(Math.ceil(cr / 5) + 2)]
        }
        for (let j = 0; j < value; j++) {
            monetaryValue += diceCalc(dice[0], dice[1], 0, dice[2]) // money is calculated in cp
        }

        const typeCatagories = {
            "Dragon": {
                "Main": [],
                "Extra": []
            },
            "Fiend": {
                "Main": [],
                "Extra": []
            },
            "Humanoid": {
                "Main": [],
                "Extra": []
            },
            "Undead": {
                "Main": [],
                "Extra": []
            },
        }

        const currency = localStorage.getItem("Currency")
        if (currency === "cp") {
            textplate.textContent += monetaryValue + " cp"
        } else if (currency === "gp") {
            textplate.textContent += monetaryValue / 100 + " gp"
        } else {
            let monetaryText =""
            let divider = 1000
            const coinValues = ["pp", "gp", "sp", "cp"]
            let currentCoin = 0
            while (monetaryValue >= 1) {
                if (monetaryValue / divider >= 1) {
                    monetaryText += Math.floor(monetaryValue / divider) + " " + coinValues[currentCoin] + ", "
                    monetaryValue -= Math.floor(monetaryValue / divider) * divider
                }
                monetaryValue = monetaryValue % divider
                divider /= 10
                currentCoin += 1
            }
            textplate.textContent += monetaryText.slice(0, -2)
        }
    })
}

IdGet("reload").addEventListener("click", function() { loadTiles() })
loadTiles()