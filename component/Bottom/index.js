import cx from "classnames";
import { Mic, Video, PhoneOff, MicOff, VideoOff } from "lucide-react";

import styles from "@/component/Bottom/index.module.css";

const Bottom = (props) => {
  const { muted, playing, toggleAudio, toggleVideo, leaveRoom, clickable, players } = props;

  const handleAudio = ()=>{
    if(Object.keys(players).length ==1 || clickable){
      // console.log(Object.keys(players).length)
      toggleAudio();
    }else{
      alert("connection in progress pls wait");
    }
  }
  const handleVideo = ()=>{
    if(Object.keys(players).length ==1 || clickable){
      toggleVideo();
    }else{
      alert("connection in progress pls wait");
    }
  }

  return (
    <div className={styles.bottomMenu}>
      {muted ? (
        <MicOff
          className={cx(styles.icon, styles.active)}
          size={55}
          onClick={handleAudio}
        />
      ) : (
        <Mic className={styles.icon} size={55} onClick={handleAudio} />
      )}
      {playing ? (
        <Video className={styles.icon} size={55} onClick={handleVideo} />
      ) : (
        <VideoOff
          className={cx(styles.icon, styles.active)}
          size={55}
          onClick={handleVideo}
        />
      )}
      <PhoneOff size={55} className={cx(styles.icon)} onClick={leaveRoom}/>
    </div>
  );
};

export default Bottom;
