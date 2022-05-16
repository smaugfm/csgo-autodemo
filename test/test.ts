import test, { Test } from 'tape';
import { NetCon } from '../electron/main/netcon/NetCon';
import { netConPort } from '../electron/common/types/misc';
import log from 'electron-log';
import * as net from 'net';
import { TelnetSocket } from 'telnet-stream';
import { delay } from '../electron/common/util';

log.transports.console.level = 'debug';

async function stop(t: Test, netcon: NetCon) {
  await netcon.stop();
  t.false(netcon['interval']);
  t.false(netcon.connected);
  t.end();
}

async function connect(t: Test, netcon: NetCon) {
  await netcon.connect();
  t.true(netcon.connected);
  t.false(netcon['interval']);
}

test('test-netcon-stop', { skip: true }, async t => {
  const netcon = new NetCon(netConPort);
  await connect(t, netcon);
  await netcon.echo('vasa');
  await stop(t, netcon);
});

test('test-netcon-stop', async t => {
  // create a Socket connection
  const socket = net.createConnection(netConPort, '127.0.0.1');
  // decorate the Socket connection as a TelnetSocket
  const tSocket = new TelnetSocket(socket);
  // if the socket closes, terminate the program
  tSocket.on('close', function () {
    console.log('telnet: close');
    return process.exit();
  });
  // if we get any data, display it to stdout
  tSocket.on('data', function (buffer) {
    return process.stdout.write(buffer.toString('utf8'));
  });
  await delay(1000);
  tSocket.write('echo vasa\n');
  tSocket.end();
});
