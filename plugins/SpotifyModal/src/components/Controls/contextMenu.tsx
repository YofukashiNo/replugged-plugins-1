import { webpack } from 'replugged';
import { React, contextMenu } from 'replugged/common';
import { ContextMenu } from 'replugged/components';

import { Components } from '@types';
import Icon from './Icons';
import {
  emitPlayPause,
  emitRepeat,
  emitShuffle,
  emitSkipNext,
  emitSkipPrev,
  emitVolume,
} from './util';

export const { MenuSliderControl } = await webpack.waitForModule<{
  MenuSliderControl: Components.MenuSliderControl;
}>(webpack.filters.byProps('Slider', 'Spinner'));

export const openControlsContextMenu = (
  ev: React.MouseEvent,
  props: Components.Props.ControlsContextMenu,
): void =>
  contextMenu.open(ev, (): JSX.Element => {
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
    const destroyed = React.useRef<boolean>(false);

    React.useEffect((): VoidFunction => {
      props.forceUpdate.current = (): void => {
        if (!destroyed.current) forceUpdate();
      };

      return (): void => {
        destroyed.current = true;
      };
    }, []);

    return (
      <ContextMenu.ContextMenu onClose={contextMenu.close} navId='spotify-modal-controls'>
        <ContextMenu.MenuGroup label='Controls'>
          <ContextMenu.MenuItem label='Toggle repeat' id='repeat'>
            <ContextMenu.MenuItem
              label='Off'
              id='repeat-off'
              disabled={props.repeat.current === 'off'}
              icon={() => <Icon.Repeat state='off' />}
              action={(e: React.MouseEvent): void => emitRepeat(e, props.repeat.current, 'off')}
            />
            <ContextMenu.MenuItem
              label='All'
              id='repeat-all'
              disabled={props.repeat.current === 'context'}
              icon={() => <Icon.Repeat state='context' />}
              action={(e: React.MouseEvent): void => emitRepeat(e, props.repeat.current, 'context')}
            />
            <ContextMenu.MenuItem
              label='Track'
              id='repeat-track'
              disabled={props.repeat.current === 'track'}
              icon={() => <Icon.Repeat state='track' />}
              action={(e: React.MouseEvent): void => emitRepeat(e, props.repeat.current, 'track')}
            />
          </ContextMenu.MenuItem>
          <ContextMenu.MenuItem
            label='Skip to previous track'
            id='skip-previous'
            icon={() => <Icon.SkipPrev />}
            action={(e: React.MouseEvent): void =>
              emitSkipPrev(e, props.duration.current, props.progress.current)
            }
          />
          <ContextMenu.MenuItem
            label={`${props.playing.current ? 'Pause' : 'Resume'} playback`}
            id='play-pause'
            icon={() => <Icon.PlayPause state={props.playing.current} />}
            action={(e: React.MouseEvent): void => emitPlayPause(e, props.playing.current)}
          />
          <ContextMenu.MenuItem
            label='Skip to next track'
            id='skip-next'
            icon={() => <Icon.SkipNext />}
            action={(e: React.MouseEvent) => emitSkipNext(e)}
          />
          <ContextMenu.MenuItem
            label={`Toggle shuffle ${props.shuffle.current ? 'off' : 'on'}`}
            id='shuffle'
            icon={() => <Icon.Shuffle state={!props.shuffle.current} />}
            action={(e: React.MouseEvent): void => emitShuffle(e, props.shuffle.current)}
          />
          <ContextMenu.MenuControlItem
            id='volume'
            label='Player volume'
            control={(data, ref): JSX.Element => (
              <MenuSliderControl
                aria-label='Player volume'
                value={props.volume.current}
                maxValue={100}
                onChange={(newVolume: number): void => emitVolume(newVolume)}
                {...data}
                ref={ref}
              />
            )}
          />
        </ContextMenu.MenuGroup>
      </ContextMenu.ContextMenu>
    );
  });
