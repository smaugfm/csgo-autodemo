import test, { Test } from 'tape';
import { NetCon } from '../electron/main/netcon/NetCon';
import { netConPort } from '../electron/common/types/misc';
import log from 'electron-log';

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

test('echo-test', { skip: true }, async t => {
  const netcon = new NetCon(netConPort);
  await connect(t, netcon);
  await netcon.echo('echo-test');
  await stop(t, netcon);
});

test('record-demo-test', { skip: false }, async t => {
  const netcon = new NetCon(netConPort);
  await connect(t, netcon);
  await netcon.recordDemo('vasa');
  await netcon.stopRecordingDemo();
  await stop(t, netcon);
});
