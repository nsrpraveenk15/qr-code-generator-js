const payloadEl = document.getElementById('payload');
const modeEl = document.getElementById('mode');
const ecEl = document.getElementById('ec');
const sizeEl = document.getElementById('size');
const generateBtn = document.getElementById('generate');
const qrContainer = document.getElementById('qr');
const meta = document.getElementById('meta');
const downloadBtn = document.getElementById('download');

function clearPreview() { 
  qrContainer.innerHTML = ''; 
  meta.textContent = ''; 
}

function detectMode(text) {
  if (/^\d+$/.test(text)) return 'Numeric';
  if (/^[0-9A-Z $%*+\-./:]+$/.test(text)) return 'Alphanumeric';
  return 'Byte';
}

function generateQRCode() {
  clearPreview();
  const text = payloadEl.value.trim();
  const ecLevel = ecEl.value;
  const moduleSize = parseInt(sizeEl.value, 10) || 8;
  if (!text) { 
    meta.textContent = 'Please enter data.'; 
    return; 
  }

  const detectedMode = detectMode(text);
  let version = 1;
  let qr;

  try {
    // Try increasing version until it fits (max version = 40)
    for (version = 1; version <= 40; version++) {
      try {
        qr = qrcode(version, ecLevel);
        qr.addData(text);
        qr.make();
        break; // success
      } catch (e) {
        if (version === 40) throw e;
      }
    }

    const cellCount = qr.getModuleCount();
    const canvasSize = cellCount * moduleSize;
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    ctx.fillStyle = '#000000';

    for (let row = 0; row < cellCount; row++) {
      for (let col = 0; col < cellCount; col++) {
        if (qr.isDark(row, col)) 
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
      }
    }

    qrContainer.appendChild(canvas);
    meta.textContent = `Version: ${version} (${cellCount}×${cellCount}) · EC: ${ecLevel} · Mode: ${detectedMode} · Size: ${moduleSize}px`;

    downloadBtn.onclick = () => {
      const link = document.createElement('a');
      link.download = 'qr_auto.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  } catch (err) {
    meta.textContent = 'Failed to generate QR: ' + (err.message || err);
  }
}

generateBtn.addEventListener('click', generateQRCode);
window.addEventListener('load', generateQRCode);
