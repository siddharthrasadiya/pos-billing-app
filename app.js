const buttons = document.querySelectorAll('button');
const status = document.getElementById('status');

if (!navigator.bluetooth) {
  buttons.forEach(b => (b.disabled = true));
  status.textContent = 'Web Bluetooth not supported. Use Chrome or Edge.';
}

function bindPrint(id, job) {
  document.getElementById(id).addEventListener('click', async () => {
    buttons.forEach(b => (b.disabled = true));
    status.textContent = 'Connecting...';
    try {
      await job();
      status.textContent = 'Printed!';
    } catch (err) {
      status.textContent = 'Error: ' + err.message;
    } finally {
      buttons.forEach(b => (b.disabled = false));
    }
  });
}

bindPrint('print', () => printText('Hello'));
bindPrint('receipt', printDemoReceipt);
