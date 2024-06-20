let autoBettingInterval;
let lastTime = Date.now() - 21000; // Ensure the initial bet can happen
let betCount = 0; // Initialize bet count

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension Installed");
    // Initialize bet count when extension is installed or reloaded
    chrome.storage.local.set({ betCount: 0 });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url.includes('https://stake.com/casino/games/slide')) {
        setTimeout(() => {
            console.log('Bet Started');
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js'],
            });
        }, 1000); // Adjust timeout as needed
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startAutoBet") {
        startAutoBetting();
    } else if (request.action === "stopAutoBet") {
        clearInterval(autoBettingInterval);
        console.log("Auto betting stopped.");
    } else if (request.action === "initiateBetting") {
        const currentTime = Date.now();
        if (currentTime - lastTime >= 21000) {
            lastTime = currentTime;
            // console.log("msg 2");
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length > 0) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        function: automateBetting,
                    });
                }
            });
        } else {
            // console.log("Bet interval has not elapsed.");
        }
    }
});

function startAutoBetting() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0 && tabs[0].url.includes('https://stake.com/casino/games/slide')) {
            // Execute checkBettingStatus immediately once
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: checkBettingStatus,
            });

            // Set up interval to check periodically if the page is ready for betting
            autoBettingInterval = setInterval(() => {
                chrome.tabs.query({ active: true, currentWindow: true }, (intervalTabs) => {
                    if (intervalTabs.length > 0 && intervalTabs[0].url.includes('https://stake.com/casino/games/slide')) {
                        chrome.scripting.executeScript({
                            target: { tabId: intervalTabs[0].id },
                            function: checkBettingStatus,
                        });
                    }
                });
            }, 1000); // Adjust interval as needed
        } else {
            console.log("Active tab is not on the betting page.");
        }
    });
}

function checkBettingStatus() {
    const betButton = document.querySelector('button[data-testid="bet-button"]');
    if (betButton && betButton.innerText.trim() === "Bet") {
        // console.log("msg 1");
        chrome.runtime.sendMessage({ action: "initiateBetting" });
    } else {
        // console.log("Page not ready for betting or bet interval has not elapsed.");
    }
}

function automateBetting() {
    const openTableButton = document.querySelector('.button-tag');
    const betAmountInput = document.querySelector('input[data-test="input-game-amount"]');
    const submitButton = document.querySelector('button[data-testid="bet-button"]');
    const element = document.querySelector('.svelte-e4myuj');
    if (!openTableButton || !betAmountInput || !submitButton) {
        console.error("Required elements not found on the page.");
        return;
    }

    console.log("Automating betting...");
    openTableButton.click();

    setTimeout(() => {
        const lastValueCell = document.querySelectorAll('.chromatic-ignore')[1];
        if (!lastValueCell) {
            console.error("Last value cell not found.");
            return;
        }

        const prevVal = Number(lastValueCell.innerText.slice(0, -1));
        const defaultBetAmount = 0.50;

        const closeButton = document.querySelector('button[data-testid="game-modal-close"]');
        closeButton.click();

        if (prevVal < 2) {
            const temp= (parseFloat(parseFloat(betAmountInput.value) * 2).toFixed(2)).toString();
            betAmountInput.value=temp;
            element.innerText=`₹${temp}`;
        } else {
            const temp = (parseFloat(defaultBetAmount).toFixed(2)).toString();
            betAmountInput.value=temp;
            element.innerText=`₹${temp}`;
        }
        // console.log("Placing bet with amount:", betAmountInput.value);
        setTimeout(()=>{
            submitButton.click();
        },1000);
    }, 3000); // Adjust the timeout as needed
}
