import cx from "classnames";
import { Mic, Video, PhoneOff, MicOff, VideoOff, Brush } from "lucide-react";

import styles from "@/component/Bottom/index.module.css";
import { toggleOpenpaint } from "@/slice/menuSlice";
import { useDispatch } from "react-redux";
import { useSocket } from "@/context/socket"
import { useRouter } from "next/router";

const Bottom = (props) => {
  const {
    muted,
    playing,
    toggleAudio,
    toggleVideo,
    leaveRoom,
    clickable,
    players,
  } = props;

  const dispatch = useDispatch()
  const socket = useSocket()
  const { roomId } = useRouter().query;

  const handleAudio = () => {
    if (Object.keys(players).length == 1 || clickable) {
      // console.log(Object.keys(players).length)
      toggleAudio();
    } else {
      alert("connection in progress pls wait");
    }
  };
  const handleVideo = () => {
    if (Object.keys(players).length == 1 || clickable) {
      toggleVideo();
    } else {
      alert("connection in progress pls wait");
    }
  };

  const handleTooglePaint = ()=>{
    dispatch(toggleOpenpaint({open: true}))
    socket?.emit('handleTooglePaint',roomId,true)
    
  }

  return (
    <div className={styles.bottomMenu}>
      {clickable && (
        <div>
          {muted ? (
            <MicOff
              className={cx(styles.icon, styles.active)}
              size={55}
              onClick={handleAudio}
            />
          ) : (
            <Mic className={styles.icon} size={55} onClick={handleAudio} />
          )}
        </div>
      )}
      {clickable && (
        <div>
          {playing ? (
            <Video className={styles.icon} size={55} onClick={handleVideo} />
          ) : (
            <VideoOff
              className={cx(styles.icon, styles.active)}
              size={55}
              onClick={handleVideo}
            />
          )}
        </div>
      )}
      {(clickable && Object.keys(players).length != 1) && (
        <div>
          <Brush
            className={cx(styles.icon)}
            size={55}
            onClick={handleTooglePaint}
          />
        </div>
      )}
      <div
        className={` ${
          !clickable
            ? `w-[100%] text-center flex justify-center items-center mx-auto`
            : null
        }`}
      >
        <PhoneOff size={55} className={cx(styles.icon)} onClick={leaveRoom} />
      </div>
    </div>
  );
};

export default Bottom;
