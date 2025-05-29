document.addEventListener('DOMContentLoaded', () => {
    const draggableItems = document.querySelectorAll('#draggableConceptsList li');
    const dropZones = document.querySelectorAll('.drop-zone');
    const conceptsSourceList = document.getElementById('draggableConceptsList');
    const checkButton = document.getElementById('checkSequenceButton');
    const resetButton = document.getElementById('resetQuizButton');
    const feedbackArea = document.getElementById('feedbackArea');

    let draggedItem = null; // To store the item being dragged

    // --- Drag Events for Draggable Items ---
    draggableItems.forEach(item => {
        item.addEventListener('dragstart', function(e) {
            draggedItem = this; // `this` is the element being dragged
            // e.dataTransfer.setData('text/plain', this.id); // Not strictly needed if using draggedItem variable
            setTimeout(() => this.style.display = 'none', 0); // Visually "lift" the item
        });

        item.addEventListener('dragend', function() {
            setTimeout(() => {
                this.style.display = 'block'; // Make it visible again if drop was not successful or outside a valid zone
                draggedItem = null;
            }, 0);
        });
    });

    // --- Drop Events for Drop Zones (the ULs) ---
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', function(e) {
            e.preventDefault(); // This is necessary to allow a drop
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

            if (draggedItem) {
                // If the drop zone already has an item, move it back to the source list
                if (this.children.length > 0) {
                    const existingItem = this.firstElementChild;
                    conceptsSourceList.appendChild(existingItem); // Return to source
                }
                this.appendChild(draggedItem); // Add the new item
                draggedItem.style.display = 'block'; // Ensure it's visible
            }
        });
    });

    // --- Allow dropping items back to the source list ---
    conceptsSourceList.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('over'); // Optional: visual feedback for source list
    });
    conceptsSourceList.addEventListener('dragleave', function() {
        this.classList.remove('over');
    });
    conceptsSourceList.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('over');
        if (draggedItem) {
            // Check if the item is not already in the source list (e.g. drag from another slot to source)
            let alreadyInSource = false;
            for(let child of this.children) {
                if(child === draggedItem) {
                    alreadyInSource = true;
                    break;
                }
            }
            if (!alreadyInSource) {
                 this.appendChild(draggedItem);
                 draggedItem.style.display = 'block';
            }
        }
    });


    // --- Check Sequence Logic ---
    checkButton.addEventListener('click', () => {
        let allCorrectAndFilled = true;
        let feedbackHtml = "<ul>";
        let placedCount = 0;

        dropZones.forEach(zone => {
            zone.classList.remove('correct-slot', 'incorrect-slot'); // Clear previous slot styling
            const expectedId = zone.dataset.expectedConceptId;
            const liElement = zone.querySelector('li');

            if (liElement) {
                placedCount++;
                const droppedId = liElement.dataset.conceptId;
                if (droppedId === expectedId) {
                    zone.classList.add('correct-slot');
                    feedbackHtml += `<li class="correct-feedback">${liElement.textContent}: Correctly placed!</li>`;
                } else {
                    zone.classList.add('incorrect-slot');
                    feedbackHtml += `<li class="incorrect-feedback">${liElement.textContent}: Incorrect in this position.</li>`;
                    allCorrectAndFilled = false;
                }
            } else {
                feedbackHtml += `<li class="empty-feedback">Slot ${zone.id.replace('slot', '')}: Is empty.</li>`;
                allCorrectAndFilled = false; // Mark as not fully correct if any slot is empty
            }
        });
        feedbackHtml += "</ul>";

        if (placedCount < dropZones.length) { // If not all slots have an item
            allCorrectAndFilled = false;
        }

        if (allCorrectAndFilled) {
            feedbackArea.innerHTML = '<p style="color:green; font-weight:bold;">Congratulations! The entire sequence is perfect!</p>';
        } else {
            if(placedCount < dropZones.length && placedCount > 0) {
                feedbackHtml = "<p>Please fill all sequence slots.</p>" + feedbackHtml;
            } else if (placedCount === 0) {
                 feedbackHtml = "<p>Please drag concepts into the sequence slots.</p>";
            }
            feedbackArea.innerHTML = feedbackHtml;
        }
    });

    // --- Reset Quiz Logic ---
    resetButton.addEventListener('click', () => {
        dropZones.forEach(zone => {
            zone.classList.remove('correct-slot', 'incorrect-slot', 'over');
            const liElement = zone.querySelector('li');
            if (liElement) {
                conceptsSourceList.appendChild(liElement); // Move item back to source
                liElement.style.display = 'block'; // Ensure it's visible
            }
        });

        // Re-order items in conceptsSourceList to original or shuffle
        const originalItems = Array.from(conceptsSourceList.querySelectorAll('li[data-concept-id]'));
        originalItems.sort((a, b) => {
            // Assuming item IDs are like 'item-c1', 'item-c2'
            return a.id.localeCompare(b.id);
        });
        originalItems.forEach(item => conceptsSourceList.appendChild(item)); // Re-append in order

        feedbackArea.innerHTML = ''; // Clear feedback
    });
});