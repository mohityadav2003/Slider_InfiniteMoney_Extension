chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "initiateBetting") {
        automateBetting();
    }
});

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
        const defaultBetAmount = 1.10;

        const closeButton = document.querySelector('button[data-testid="game-modal-close"]');
        closeButton.click();

        let newBetAmount;
        if (prevVal < 2) {
            newBetAmount = parseFloat(parseFloat(betAmountInput.value) * 2).toFixed(2);
        } else {
            newBetAmount = parseFloat(defaultBetAmount).toFixed(2);
        }

        // Set the new value and trigger input events
        betAmountInput.value = newBetAmount;
        element.innerText = `₹${newBetAmount}`;
        
        // Create and dispatch the input and change events
        const inputEvent = new Event('input', { bubbles: true });
        const changeEvent = new Event('change', { bubbles: true });
        betAmountInput.dispatchEvent(inputEvent);
        betAmountInput.dispatchEvent(changeEvent);

        setTimeout(() => {
            submitButton.click();
        }, 1000);
    }, 3000); // Adjust the timeout as needed
}
