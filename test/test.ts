import test, { Test } from 'tape';
import { NetCon } from '../electron/main/netcon/NetCon';
import { netConPort } from '../electron/common/types/misc';
import log from 'electron-log';
import { anyString, instance, mock, verify, when } from 'ts-mockito';
import { TestEventEmitter } from './TestEventEmitter';
import { autodemo } from '../electron/main/Autodemo';

log.transports.console.level = 'debug';

async function stop(t: Test, netcon: NetCon) {
  await netcon.stop();
  t.false(netcon.connected);
  t.end();
}

async function connect(t: Test, netcon: NetCon) {
  await netcon.setupConnectionLoop();
  t.true(netcon.connected);
}

test('NetCon simple sends echo command', { skip: true }, async t => {
  const netcon = new NetCon(netConPort);
  await connect(t, netcon);
  await netcon.echo('echo-test');
  await stop(t, netcon);
});

test('Netcon record demo test', { skip: true }, async t => {
  const netcon = new NetCon(netConPort);
  await connect(t, netcon);
  await netcon.recordDemo('vasa');
  await netcon.stopRecordingDemo();
  await stop(t, netcon);
});

test(
  'Netcon records and stops when game started and ends',
  { skip: true },
  async t => {
    const mockedNetCon = mock(NetCon);
    when(mockedNetCon.recordDemo(anyString())).thenResolve();
    when(mockedNetCon.stopRecordingDemo()).thenResolve();
    const gsi = new TestEventEmitter();

    autodemo(instance(mockedNetCon), gsi as any, 'vasa');
    await gsi.emitAwait('gamePhase', 'live');
    await gsi.emitAwait('gamePhase', 'gameover');

    verify(mockedNetCon.recordDemo(anyString())).once();
    verify(mockedNetCon.stopRecordingDemo()).once();

    t.end();
  },
);

test('Netcon continues recording on disconnect', { skip: true }, async t => {
  const mockedNetCon = mock(NetCon);
  when(mockedNetCon.recordDemo(anyString())).thenResolve();
  when(mockedNetCon.stopRecordingDemo()).thenResolve();
  const gsi = new TestEventEmitter();

  const netcon = instance(mockedNetCon);
  autodemo(netcon, gsi as any, 'vasa');
  await gsi.emitAwait('gamePhase', 'live');
  await netcon.stop();
  await gsi.emitAwait('gamePhase', 'live');
  await gsi.emitAwait('gamePhase', 'gameover');

  verify(mockedNetCon.recordDemo(anyString())).once();
  verify(mockedNetCon.stopRecordingDemo()).once();

  t.end();
});
