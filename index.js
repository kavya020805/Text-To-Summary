// Constants
const GEMINI_API_KEY = 'AIzaSyB3V07QTCB8jc79y92xtl6c8oORJXe02UM';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
const feedbackDisplayTime = 8000;

// Element Selectors
const textInputArea = document.getElementById('text-input-area');
const summaryLengthContainer = document.getElementById('summary-length-container');
const summaryLengthRadios = document.getElementsByName('summary-length');
const summarizeButton = document.getElementById('summarize-button');
const summaryContent = document.getElementById('summary-content');
const summaryOutputArea = document.getElementById('summary-output-area');
const copyButton = document.getElementById('copy-button');
const clearButton = document.getElementById('clear-button');
const loadingSection = document.getElementById('loading-section');
const errorSection = document.getElementById('error-section');
const errorMessage = document.getElementById('error-message');
const dismissErrorButton = document.getElementById('dismiss-error-button');

// Button Event Listeners
summarizeButton.addEventListener('click', summarize);
copyButton.addEventListener('click', copy);
clearButton.addEventListener('click', clear);
dismissErrorButton.addEventListener('click', dismissError);

// Other Event Listeners
document.addEventListener('DOMContentLoaded', focusOnTextInputArea);
textInputArea.addEventListener('input', scrollTextAreaToTopAndEnableControls);

// Gemini Summarizer Function (fixed)
async function summarizeWithGemini(text, length = 'medium') {
  const prompt = `Summarize the following text in ${length} length:\n${text}`;

  const body = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ]
  };

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok || !data.candidates || !data.candidates[0]) {
    throw new Error(data.error?.message || 'Failed to fetch summary from Gemini');
  }

  return data.candidates[0].content.parts[0].text;
}

// Summarize Handler
async function summarize() {
  try {
    if (!textInputArea.value.trim()) {
      throw new Error('Please enter some text to summarize');
    }

    startLoading();
    const text = textInputArea.value;
    const summaryLength = document.querySelector('input[name="summary-length"]:checked').value;

    const summary = await summarizeWithGemini(text, summaryLength);

    endLoading();
    summaryOutputArea.value = summary;
    enableSummaryOutputArea();
    enableCopyButton();
    focusOnCopyButton();
  } catch (error) {
    handleError(error);
  }
}

// Copy Handler
async function copy() {
  try {
    await navigator.clipboard.writeText(summaryOutputArea.value);
    showCopyFeedback('😄 Copied', 'success');
  } catch (err) {
    showCopyFeedback('😔 Failed', 'failure');
  }
}

// Clear Handler
function clear() {
  clearTextInputArea();
  clearSummaryOutputArea();
  enableTextInputArea();
  focusOnTextInputArea();
  disableAllControls();
}

// Dismiss Error Handler
function dismissError() {
  hideErrorSection();
  displaySummaryContent();
  clear();
}

// Helpers
function focusOnTextInputArea() {
  textInputArea.focus();
}

function scrollTextAreaToTopAndEnableControls() {
  scrollTextAreaToTop();
  enableControls();
}

function scrollTextAreaToTop() {
  setTimeout(() => {
    textInputArea.scrollTop = 0;
  }, 0);
}

function enableControls() {
  if (textInputArea.value.trim() !== '') {
    enableSummaryLengthContainer();
    enableSummarizeButton();
    enableClearButton();
  } else {
    disableAllControls();
  }
}

function disableAllControls() {
  disableSummaryLengthContainer();
  disableSummarizeButton();
  disableSummaryOutputArea();
  disableClearButton();
  disableCopyButton();
}

function startLoading() {
  hideSummaryContent();
  displayLoadingSection();
}

function endLoading() {
  hideLoadingSection();
  displaySummaryContent();
}

function handleError(error) {
  endLoading();
  disableTextInputArea();
  disableAllControls();
  hideSummaryContent();
  setErrorMessageText(error.message || 'An unexpected error occurred. Please try again.');
  displayErrorSection();
}

function showCopyFeedback(message, status) {
  const feedbackClass = status === 'success' ? 'copied' : 'failed';
  addClassToCopyButton(feedbackClass);
  setCopyButtonText(message);
  setTimeout(() => {
    removeClassFromCopyButton(feedbackClass);
    setCopyButtonText('Copy');
  }, feedbackDisplayTime);
}

function focusOnCopyButton() {
  copyButton.focus();
}

function displaySummaryContent() {
  summaryContent.style.display = 'flex';
}

function displayLoadingSection() {
  loadingSection.style.display = 'flex';
}

function displayErrorSection() {
  errorSection.style.display = 'flex';
}

function hideLoadingSection() {
  loadingSection.style.display = 'none';
}

function hideErrorSection() {
  errorSection.style.display = 'none';
}

function hideSummaryContent() {
  summaryContent.style.display = 'none';
}

function enableTextInputArea() {
  textInputArea.disabled = false;
}

function enableSummaryLengthContainer() {
  summaryLengthContainer.classList.remove('disabled');
}

function enableClearButton() {
  clearButton.disabled = false;
}

function enableSummarizeButton() {
  summarizeButton.disabled = false;
}

function enableSummaryOutputArea() {
  summaryOutputArea.disabled = false;
}

function enableCopyButton() {
  copyButton.disabled = false;
}

function disableCopyButton() {
  copyButton.disabled = true;
}

function disableClearButton() {
  clearButton.disabled = true;
}

function disableSummaryOutputArea() {
  summaryOutputArea.disabled = true;
}

function disableSummarizeButton() {
  summarizeButton.disabled = true;
}

function disableSummaryLengthContainer() {
  summaryLengthContainer.classList.add('disabled');
}

function disableTextInputArea() {
  textInputArea.disabled = true;
}

function setErrorMessageText(text) {
  errorMessage.textContent = text;
}

function setCopyButtonText(text) {
  copyButton.textContent = text;
}

function clearTextInputArea() {
  textInputArea.value = '';
}

function clearSummaryOutputArea() {
  summaryOutputArea.value = '';
}

function removeClassFromCopyButton(className) {
  copyButton.classList.remove(className);
}

function addClassToCopyButton(className) {
  copyButton.classList.add(className);
}
