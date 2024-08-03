import ReactPlayer from "react-player";
import cx from "classnames";
import { Mic, MicOff, UserSquare2, Video, VideoOff } from "lucide-react";

import styles from "@/component/Player/index.module.css";

const Player = (props) => {
  const { url, muted, playing, isActive, me } = props;
  return (
    <div
      className={cx(styles.playerContainer, {
        [styles.notActive]: !isActive,
        [styles.active]: isActive,
        [styles.notPlaying]: !playing,
      })}
    >
      {playing ? (
        <ReactPlayer
          url={url}
          muted={muted}
          playing={playing}
          width="100%"
          height="100%"
        />
      ) : (
        <UserSquare2 className={styles.user} size={isActive ? 400 : 150} />
      )}

      <div className={styles.icon}>
        {isActive && me ? (
          muted ? (
            <MicOff className={'text-white'} size={20} />
          ) : (
            <Mic className={'text-white'} size={20} />
          )
        ) : undefined}
        {isActive && me ? (
          !playing ? (
            <VideoOff className={'text-white'} size={20} />
          ) : (
            <Video className={'text-white'} size={20} />
          )
        ) : undefined}
      </div>
    </div>
  );
};

export default Player;
