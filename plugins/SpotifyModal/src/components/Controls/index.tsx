import React from 'react';

import { lodash as _ } from 'replugged/common';

import { mergeClassNames } from '@shared/dom';

import Button from './Buttons';

import { config } from '../../config';
import { globalEvents, logger, useControls, usePlayerControlStates } from '../../util';

const nextRepeatStates = {
  normal: { off: 'context', context: 'track', track: 'off' },
  noContext: { off: 'track', context: 'off', track: 'off' },
  noTrack: { off: 'context', context: 'off', track: 'off' },
} as const;

export const ControlButtons = (props: { progress: number }): JSX.Element => {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  const { setProgress, setPlaying, setRepeat, setShuffle, skip } = useControls();
  const { disallows, duration, playing, repeat, shuffle } = usePlayerControlStates();

  React.useEffect(
    () =>
      globalEvents.on('settingsUpdate', (event): void => {
        if (event.detail.key === 'controlsLayout') {
          forceUpdate();
          logger.log('(controls)', 'controls layout update', _.clone(event.detail.value));
        }
      }),
    [],
  );

  return (
    <>
      {config.get('controlsLayout').map((kind): JSX.Element => {
        switch (kind) {
          case 'play-pause':
            return (
              <Button.PlayPause
                onClick={() => setPlaying(!playing)}
                state={playing}
                disabled={playing ? disallows.pausing : disallows.resuming}
              />
            );
          case 'repeat':
            return (
              <Button.Repeat
                onClick={() => {
                  if (disallows.toggling_repeat_context)
                    setRepeat(nextRepeatStates.noContext[repeat]);
                  else if (disallows.toggling_repeat_track)
                    setRepeat(nextRepeatStates.noTrack[repeat]);
                  else setRepeat(nextRepeatStates.normal[repeat]);
                }}
                state={repeat}
                disabled={disallows.toggling_repeat_context && disallows.toggling_repeat_track}
              />
            );
          case 'shuffle':
            return (
              <Button.Shuffle
                onClick={() => setShuffle(!shuffle)}
                state={shuffle}
                disabled={disallows.toggling_shuffle}
              />
            );
          case 'skip-prev':
            return (
              <Button.SkipPrev
                onClick={() => {
                  if (
                    config.get('skipPreviousShouldResetProgress') &&
                    config.get('skipPreviousProgressResetThreshold') * duration <= props.progress &&
                    !disallows.seeking
                  )
                    setProgress(0);
                  else if (!disallows.skipping_prev) skip(false);
                }}
                disabled={
                  config.get('skipPreviousShouldResetProgress') &&
                  config.get('skipPreviousProgressResetThreshold') * duration <= props.progress
                    ? disallows.seeking
                    : disallows.skipping_prev
                }
              />
            );
          case 'skip-next':
            return (
              <Button.SkipNext onClick={() => skip(true)} disabled={disallows.skipping_next} />
            );
          default:
            return <Button.None />;
        }
      })}
    </>
  );
};

export const Controls = (props: { progress: number; shouldShow: boolean }): React.ReactElement => (
  <div className={mergeClassNames('controls-container', props.shouldShow ? '' : 'hidden')}>
    <ControlButtons {...props} />
  </div>
);

export * from './Icons';
export * from './Buttons';
export * from './contextMenu';
