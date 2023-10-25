import { React, fluxDispatcher, modal } from 'replugged/common';
import { Button } from 'replugged/components';

import * as util from './util';
import * as components from './components';
import { config } from './config';
import { Modal } from './components';
import { events } from './util';
import { SpotifyAccount, SpotifySocketData } from './types';

import './style.css';

export const renderModal = (): JSX.Element => (
  <div id='spotify-modal-root'>
    <Modal />
  </div>
);

export const emitMessage = (msg: MessageEvent<string>, account: SpotifyAccount): void => {
  const raw = JSON.parse(msg.data) as SpotifySocketData;

  if (raw.type === 'message' && raw.payloads?.[0]?.events?.[0])
    events.emit('message', { accountId: account.accountId, data: raw.payloads[0].events[0] });
};

const postConnectionOpenListener = (): void => {
  fluxDispatcher.unsubscribe('POST_CONNECTION_OPEN', postConnectionOpenListener);

  events.debug('start', ['waited for POST_CONNECTION_OPEN']);
  events.emit('ready');
};

// to detect account switches - we need to reset the modal
const loginSuccessListener = (): void => {
  events.emit('accountSwitch');
  fluxDispatcher.subscribe('POST_CONNECTION_OPEN', postConnectionOpenListener);
};

export const start = (): void => {
  if (!document.getElementById('spotify-modal-root'))
    fluxDispatcher.subscribe('POST_CONNECTION_OPEN', postConnectionOpenListener);
  fluxDispatcher.subscribe('LOGIN_SUCCESS', loginSuccessListener);
};

export const stop = async (): Promise<void> => {
  const res =
    config.get('pluginStopBehavior') === 'ask'
      ? await modal.confirm({
          title: 'Restart Discord',
          body: 'It is recommended that you restart Discord after reloading / disabling SpotifyModal. Restart now? (Control this behavior in Settings)',
          confirmText: 'Yes',
          cancelText: 'No',
          confirmColor: Button.Colors.RED,
        })
      : config.get('pluginStopBehavior') === 'restartDiscord';

  events.debug('stop', ['restart Discord:', res]);

  if (res) window.DiscordNative.app.relaunch();
};

export { Settings } from './components';

export const _ = Object.freeze({
  components,
  config,
  util,
});
