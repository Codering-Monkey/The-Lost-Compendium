import {setColours, IdGet, createOverlay, lineBreak} from "../scripts/script.js"
import colours from "../colour.json" with { type: 'json' };

fetch('../navbar/nav.html')
.then(res => res.text())
.then(text => {
    let oldelem = document.querySelector("script#replace_with_navbar");
    let newelem = document.createElement("div");
    newelem.innerHTML = text;
    oldelem.parentNode.replaceChild(newelem,oldelem);
    let link = document.createElement("link")
    link.rel = "icon"
    link.type = "image/x-icon"
    link.href = "./favicon.ico"
    document.head.appendChild(link)
    if (!localStorage.getItem("Colour")) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            localStorage.setItem("Colour", "Darcula")
        } else {
            localStorage.setItem("Colour", "Forest")
        }
    }
    IdGet("settings").addEventListener("click", function() {
        let overlay = createOverlay()

        let title = document.createElement("h2")
        title.textContent = "Settings"
        overlay.appendChild(title)

        lineBreak(overlay)

        let colourLabel = document.createElement("label")
        colourLabel.textContent = "Colour"
        overlay.appendChild(colourLabel)
        let colourEntry = document.createElement("select")
        Object.entries(colours).forEach(([key, value]) => {
            let colourOption = document.createElement("option")
            colourOption.textContent = key
            colourEntry.appendChild(colourOption)
        });
        colourEntry.value = localStorage.getItem("Colour")
        colourEntry.addEventListener("change", function (e) {
            localStorage.setItem("Colour", colourEntry.value)
            setColours()
        })
        colourEntry.id = "colour"
        colourLabel.setAttribute("for", "colour")
        overlay.appendChild(colourEntry)

        lineBreak(overlay, 2)

        let measureLabel = document.createElement("label")
        measureLabel.textContent = "Measurement"
        overlay.appendChild(measureLabel)
        let measureEntry = document.createElement("select")
        Object.entries({"Feet": "ft", "Metres": "m"}).forEach(([key, value]) => {
            let measureOption = document.createElement("option")
            measureOption.textContent = key
            measureOption.value = value
            measureEntry.appendChild(measureOption)
        })
        measureEntry.addEventListener("change", function() {
            localStorage.setItem("Unit", measureEntry.value)
        })
        if (!localStorage.getItem("Unit")) {
            localStorage.setItem("Unit", "m")
        }
        measureEntry.value = localStorage.getItem("Unit")
        measureEntry.id = "measurement"
        measureLabel.setAttribute("for", "measurement")
        overlay.appendChild(measureEntry)

        lineBreak(overlay, 2)

        let currencyLabel = document.createElement("label")
        currencyLabel.textContent = "Currency"
        overlay.appendChild(currencyLabel)
        let currencyEntry = document.createElement("select")
        Object.entries({"Copper Pieces": "cp", "Gold Pieces": "gp", "Smallest Denomination": "any"}).forEach(([key, value]) => {
            let currencyOption = document.createElement("option")
            currencyOption.textContent = key
            currencyOption.value = value
            currencyEntry.appendChild(currencyOption)
        })
        currencyEntry.addEventListener("change", function() {
            localStorage.setItem("Currency", currencyEntry.value)
        })
        if (!localStorage.getItem("Currency")) {
            localStorage.setItem("Currency", "any")
        }
        currencyEntry.value = localStorage.getItem("Currency")
        currencyEntry.id = "currency"
        currencyLabel.setAttribute("for", "currency")
        overlay.appendChild(currencyEntry)
    })
    setColours()
})