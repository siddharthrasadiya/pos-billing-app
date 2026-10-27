const PRINTER_SERVICES = [
  0x18f0,
  0xff00,
  0xffe0,
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455'
];

const ESC = {
  init: '\x1B\x40',
  left: '\x1B\x61\x00',
  center: '\x1B\x61\x01',
  right: '\x1B\x61\x02',
  boldOn: '\x1B\x45\x01',
  boldOff: '\x1B\x45\x00',
  bigOn: '\x1D\x21\x11',
  bigOff: '\x1D\x21\x00',
  feed: '\n\n\n\n'
};

const LINE_WIDTH = 32;

async function connectPrinter() {
  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: PRINTER_SERVICES
  });

  const server = await device.gatt.connect();
  const services = await server.getPrimaryServices();

  for (const service of services) {
    for (const c of await service.getCharacteristics()) {
      if (c.properties.write || c.properties.writeWithoutResponse) {
        return { device, writer: c };
      }
    }
  }

  device.gatt.disconnect();
  throw new Error('No writable characteristic found on this device');
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// Android Chrome does not negotiate a larger BLE MTU, so each write must fit in 20 bytes
async function writeChunked(writer, bytes) {
  const CHUNK = 20;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const part = bytes.slice(i, i + CHUNK);
    if (writer.properties.write) {
      await writer.writeValueWithResponse(part);
    } else {
      await writer.writeValueWithoutResponse(part);
      await wait(20);
    }
  }
}

async function printText(text) {
  const { device, writer } = await connectPrinter();
  try {
    const bytes = new TextEncoder().encode(ESC.init + text + ESC.feed);
    await writeChunked(writer, bytes);
  } finally {
    device.gatt.disconnect();
  }
}

function divider(char = '-') {
  return char.repeat(LINE_WIDTH) + '\n';
}

function columns(left, right, width = LINE_WIDTH) {
  const space = width - left.length - right.length;
  return left + ' '.repeat(Math.max(1, space)) + right + '\n';
}
