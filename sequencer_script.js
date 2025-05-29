document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Define Concepts with Detailed Feedback ---
    const concepts = [
        {
            id: "c1",
            text: "Include Libraries",
            correctFeedback: "Correct! Libraries are included at the very beginning to make their functions and objects available to your entire sketch.",
            incorrectHint: "Hint: Library includes (#include) should always be the first active code lines, before global variables, setup(), or loop()."
        },
        {
            id: "c2",
            text: "Define Global Variables & Constants",
            correctFeedback: "Correct! Global variables and constants are defined after any library includes but before setup(), making them accessible from anywhere in your sketch.",
            incorrectHint: "Hint: Declare global variables and constants at the top, right after including libraries, so all parts of your code (setup and loop) can use them."
        },
        {
            id: "c3",
            text: "Initialize Hardware & Settings (in setup)",
            correctFeedback: "Excellent! The setup() function is where you initialize pin modes, start serial communication, and prepare hardware. This code runs only once when the Arduino starts.",
            incorrectHint: "Hint: One-time hardware initializations (like setting pin modes or starting Serial communication) belong inside the setup() function."
        },
        {
            id: "c4",
            text: "Read Inputs & Sensors (in loop)",
            correctFeedback: "Spot on! The loop() function is where you continuously read changing inputs like sensor data or check for button presses.",
            incorrectHint: "Hint: Tasks that need to happen repeatedly, like reading sensor values, are placed inside the main loop()."
        },
        {
            id: "c5",
            text: "Control Outputs & Logic (in loop)",
            correctFeedback: "Perfect! Based on the inputs read and your program's logic, controlling outputs (like LEDs or motors) and making decisions happens continuously in the loop().",
            incorrectHint: "Hint: The core logic of your program, including making decisions based on inputs and controlling outputs, resides in the loop() and runs repeatedly."
        }
    ];

    // --- 2. Get DOM Elements ---
    const conceptsSourceList = document.getElementById('draggableConceptsList');
    const dropZones = document.querySelectorAll('.drop-zone'); // These are the ULs for slots
    const checkButton = document.getElementById('checkSequenceButton');
    const resetButton = document.getElementById('resetQuizButton');
    const feedbackArea = document.getElementById('feedbackArea');

    let draggedItem = null; // To store the item currently being dragged

    // --- 3. Dynamically Create and Populate Draggable Concept Items ---
    function initializeConceptItems() {
        conceptsSourceList.innerHTML = ''; // Clear any existing items (useful for reset)
        concepts.forEach(concept => {
            const li = document.createElement('li');
            li.id = `item-${concept.id}`; // e.g., item-c1
            li.dataset.conceptId = concept.id; // e.g., c1
            li.textContent = concept.text;
            li.draggable = true;

            // Add drag event listeners to each new item
            addDragEventsToItem(li);
            conceptsSourceList.appendChild(li);
        });
    }

    // --- 4. Drag and Drop Event Handlers ---
    function addDragEventsToItem(item) {
        item.addEventListener('dragstart', function(e) {
            draggedItem = this;
            // e.dataTransfer.setData('text/plain', this.id); // Optional, not strictly needed with draggedItem
            setTimeout(() => this.style.opacity = '0.5', 0); // Visually indicate dragging
        });

        item.addEventListener('dragend', function() {
            setTimeout(() => {
                this.style.opacity = '1'; // Restore opacity
                // If draggedItem is still 'this', it means it wasn't dropped successfully into a new parent
                // or it was dropped back into the source list handled by the source list's drop event.
                if (draggedItem === this && this.parentElement !== conceptsSourceList) {
                    // This case can happen if it's dropped somewhere invalid outside a dropzone.
                    // We want it to remain visible.
                }
                draggedItem = null; // Clear draggedItem after drag operation ends
            }, 0);
        });
    }

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', function(e) {
            e.preventDefault(); // Necessary to allow a drop
            this.classList.add('over');
        });

        zone.addEventListener('dragenter', function(e) {
            e.preventDefault();
            this.classList.add('over');
        });

        zone.addEventListener('dragleave', function() {
            this.classList.remove('over');
        });

        zone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('over');

            if (draggedItem && draggedItem.parentElement !== this) { // Ensure it's not already in this zone
                // If the drop zone (this UL) already has an item, move it back to the source list
                if (this.children.length > 0) {
                    const existingItem = this.firstElementChild;
                    conceptsSourceList.appendChild(existingItem); // Return to source
                    // existingItem.style.opacity = '1'; // Ensure returned item is fully visible
                }
                this.appendChild(draggedItem); // Add the newly dragged item
                // draggedItem.style.opacity = '1'; // Ensure dropped item is fully visible
            }
        });
    });

    // Allow dropping items back to the source list
    conceptsSourceList.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('over');
    });

    conceptsSourceList.addEventListener('dragleave', function() {
        this.classList.remove('over');
    });

    conceptsSourceList.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('over');
        if (draggedItem && draggedItem.parentElement !== this) { // Check if it's not already there
            this.appendChild(draggedItem);
            // draggedItem.style.opacity = '1';
        }
    });

    // --- 5. Check Sequence Logic with Detailed Feedback ---
    checkButton.addEventListener('click', () => {
        let allSlotsCorrectlyFilled = true;
        let feedbackHtml = "<ul>";
        let itemsPlacedCount = 0;

        const getConceptDataById = (id) => concepts.find(c => c.id === id);

        dropZones.forEach((zone, index) => {
            zone.classList.remove('correct-slot', 'incorrect-slot'); // Clear previous styling
            const slotNumber = index + 1;
            const expectedConceptId = zone.dataset.expectedConceptId;
            const expectedConceptData = getConceptDataById(expectedConceptId);
            const liElement = zone.querySelector('li'); // Each slot UL should have at most one LI

            if (liElement) {
                itemsPlacedCount++;
                const droppedConceptId = liElement.dataset.conceptId;
                const droppedConceptData = getConceptDataById(droppedConceptId);

                if (droppedConceptData) {
                    if (droppedConceptId === expectedConceptId) {
                        zone.classList.add('correct-slot');
                        feedbackHtml += `<li class="correct-feedback"> ${droppedConceptData.correctFeedback}</li>`;
                    } else {
                        zone.classList.add('incorrect-slot');
                        feedbackHtml += `<li class="incorrect-feedback"><strong>${droppedConceptData.text}</strong> is not the correctly placed. ${droppedConceptData.incorrectHint}`;
                        feedbackHtml += `</li>`;
                        allSlotsCorrectlyFilled = false;
                    }
                } else {
                    feedbackHtml += `<li class="incorrect-feedback"><strong>Slot ${slotNumber}:</strong> An unrecognized item ('${liElement.textContent}') is in this slot.</li>`;
                    zone.classList.add('incorrect-slot');
                    allSlotsCorrectlyFilled = false;
                }
            } else { // Slot is empty
                feedbackHtml += `<li class="empty-feedback"><strong>Slot ${slotNumber} is not filled yet.`;
                // if (expectedConceptData) {
                //     feedbackHtml += ` It should contain: '${expectedConceptData.text}'.`;
                // }
                feedbackHtml += `</li>`;
                allSlotsCorrectlyFilled = false;
            }
        });
        feedbackHtml += "</ul>";

        if (itemsPlacedCount < concepts.length) {
            allSlotsCorrectlyFilled = false;
        }

        if (allSlotsCorrectlyFilled) {
            feedbackArea.innerHTML = '<p style="color:green; font-weight:bold;">Congratulations! The entire sequence is perfect and all concepts are used!</p>';
        } else {
            let preamble = "";
            if (itemsPlacedCount === 0) {
                preamble = "<p>Please drag the concepts into the sequence slots to begin.</p>";
                feedbackArea.innerHTML = preamble; // Don't show detailed list if nothing placed
            } else if (itemsPlacedCount < concepts.length && itemsPlacedCount > 0) {
                preamble = "<p>Some concepts are not yet placed, or some are in the wrong sequence. Please review the feedback below:</p>";
                feedbackArea.innerHTML = preamble + feedbackHtml;
            } else { // All slots have items, but some are incorrect
                preamble = "<p>Some concepts are in the wrong sequence. Please review the feedback below:</p>";
                feedbackArea.innerHTML = preamble + feedbackHtml;
            }
        }
    });

    // --- 6. Reset Quiz Logic ---
    function resetQuiz() {
        dropZones.forEach(zone => {
            zone.classList.remove('correct-slot', 'incorrect-slot', 'over');
            // Remove any child li from the drop zone
            if (zone.children.length > 0) {
                // The items are moved back by initializeConceptItems if it clears and re-adds all
                // Or we can explicitly move them back now:
                // const liElement = zone.firstElementChild;
                // conceptsSourceList.appendChild(liElement);
                // liElement.style.opacity = '1';
                zone.innerHTML = ''; // Clear the slot
            }
        });
        feedbackArea.innerHTML = ''; // Clear feedback text
        initializeConceptItems(); // Re-populate the source list (this also re-attaches drag listeners)
        // Optional: shuffle items in source list for a new challenge
        shuffleChildren(conceptsSourceList);
    }

    resetButton.addEventListener('click', resetQuiz);

    function shuffleChildren(parent) {
        let children = Array.from(parent.children);
        for (let i = children.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [children[i], children[j]] = [children[j], children[i]];
        }
        children.forEach(child => parent.appendChild(child)); // Re-append in shuffled order
    }

    // --- Initial setup ---
    initializeConceptItems(); // Create the draggable items when the page loads
    shuffleChildren(conceptsSourceList); // Shuffle them initially

});