import { useEffect, useRef, useState } from "react";
import { cloneDeep, map } from "lodash";

import { useSocket } from "@/context/socket";
import usePeer from "@/hooks/usePeer";
import useMediaStream from "@/hooks/useMediaStream";
import usePlayer from "@/hooks/usePlayer";

import Player from "@/component/Player";
import Bottom from "@/component/Bottom";
import CopySection from "@/component/CopySection";

import styles from "@/styles/room.module.css";
import { useRouter } from "next/router";
import { UserSquare2 } from "lucide-react";
import ReactPlayer from "react-player";
import Menu from "@/component/Menu";
import Toolbox from "@/component/Toolbox";
import Board from "@/component/Board";
import Close from "@/component/close";
import { useDispatch, useSelector } from "react-redux";
import { toggleOpenpaint } from "@/slice/menuSlice";

const Room = () => {
  const { openPaint } = useSelector((state) => state.menu);
  const socket = useSocket();
  const router = useRouter();
  const { roomId } = useRouter().query;
  const { peer, myId } = usePeer();
  const { stream } = useMediaStream();
  const dispatch = useDispatch();
  const {
    players,
    setPlayers,
    playerHighlighted,
    nonHighlightedPlayers,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  } = usePlayer(myId, roomId, peer, stream);

  const [users, setUsers] = useState([]);

  const playerRef = useRef(players);
  const myIdRef = useRef(myId);
  const openPaintref = useRef(openPaint);

  const ref = useRef(false);
  const ref2 = useRef(false);

  useEffect(() => {
    playerRef.current = players;
    myIdRef.current = myId;
    openPaintref.current = openPaint;
  }, [players, myId, openPaint]);

  // call the joined person and send strams also and also receive the streams from him/her
  useEffect(() => {
    if (!socket || !peer || !stream) return;
    const handleUserConnected = (newUser) => {
      // console.log(`user connected in room with userId ${newUser}`);

      const call = peer.call(newUser, stream, {
        metadata: {
          muted: playerRef.current[myIdRef.current].muted,
          playing: playerRef.current[myIdRef.current].playing,
          isOpened: openPaintref.current,
        },
      });

      call.on("stream", (incomingStream) => {
        // console.log(`incoming stream from ${newUser}`);
        let muted = true;
        let playing = true;
        setPlayers((prev) => ({
          ...prev,
          [newUser]: {
            url: incomingStream,
            muted: muted,
            playing: playing,
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [newUser]: call,
        }));
        ref.current = true;
      });
    };
    socket.on("user-connected", handleUserConnected);

    return () => {
      socket.off("user-connected", handleUserConnected);
    };
  }, [peer, setPlayers, socket, stream]);

  useEffect(() => {
    if (!socket) return;
    const handleToggleAudio = (userId) => {
      // console.log(`user with id ${userId} toggled audio`);
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        copy[userId].muted = !copy[userId].muted;
        return { ...copy };
      });
    };

    const handleToggleVideo = (userId) => {
      // console.log(`user with id ${userId} toggled video`);
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        copy[userId].playing = !copy[userId].playing;
        return { ...copy };
      });
    };

    const handleUserLeave = (userId) => {
      // console.log(`user ${userId} is leaving the room`);
      users[userId]?.close(); //as users contain the call obj
      const playersCopy = cloneDeep(players);
      delete playersCopy[userId];
      // peer?.disconnect();
      // stream.getTracks().forEach(track => track.stop());
      setPlayers(playersCopy);
      // router.push('/')
    };
    socket.on("user-toggle-audio", handleToggleAudio);
    socket.on("user-toggle-video", handleToggleVideo);
    socket.on("user-leave", handleUserLeave);
    return () => {
      socket.off("user-toggle-audio", handleToggleAudio);
      socket.off("user-toggle-video", handleToggleVideo);
      socket.off("user-leave", handleUserLeave);
    };
  }, [players, setPlayers, socket, users]);

  // the receiver answer calls and send its streams also
  useEffect(() => {
    if (!peer || !stream) return;
    peer.on("call", (call) => {
      const { peer: callerId } = call;
      const muted = call.metadata.muted;
      const playing = call.metadata.playing;
      const isOpened = call.metadata.isOpened;

      dispatch(toggleOpenpaint({ open: isOpened }));

      call.answer(stream); //send streams also

      call.on("stream", (incomingStream) => {
        // console.log(`incoming stream from ${callerId}`);
        setPlayers((prev) => ({
          ...prev,
          [callerId]: {
            url: incomingStream,
            muted: muted,
            playing: playing,
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [callerId]: call,
        }));

        ref.current = true;
      });
    });
  }, [peer, setPlayers, stream, dispatch]);

  // opening streams of current user
  useEffect(() => {
    if (!stream || !myId || ref2.current) return;
    // console.log(`setting my stream ${myId}`);
    ref2.current = true;
    setPlayers((prev) => ({
      ...prev,
      [myId]: {
        url: stream,
        muted: true,
        playing: true,
      },
    }));
  }, [myId, setPlayers, stream]);

  // console.log(playerHighlighted);

  useEffect(() => {
    if (!socket) return;

    const handleTooglePaint = (isOpened) => {
      dispatch(toggleOpenpaint({ open: isOpened }));
    };

    socket.on("handleTooglePaint", handleTooglePaint);

    return () => {
      socket.off("handleTooglePaint", handleTooglePaint);
    };
  }, [socket, dispatch]);

  return (
    <>
      {!openPaint ? (
        <>
          <div className={styles.activePlayerContainer}>
            {Object.keys(nonHighlightedPlayers).length != 0 ? (
              Object.keys(nonHighlightedPlayers).map((playerId) => {
                const { url, muted, playing } = nonHighlightedPlayers[playerId];
                return (
                  <Player
                    key={playerId}
                    url={url}
                    muted={muted}
                    playing={playing}
                    isActive={true}
                    me={true}
                  />
                );
              })
            ) : (
              <>
                <div className=" text-center mx-auto my-auto text-4xl mt-10 font-light text-blue-300 animate-pulse">
                  Connecting...
                </div>
                <div className={styles.activePlayerContainer}>
                  {playerHighlighted && (
                    <Player
                      url={playerHighlighted.url}
                      muted={playerHighlighted.muted}
                      playing={playerHighlighted.playing}
                      isActive={true}
                      me={false}
                    />
                  )}
                </div>
              </>
            )}
          </div>
          <div className={styles.inActivePlayerContainer}>
            {playerHighlighted &&
              Object.keys(nonHighlightedPlayers).length != 0 && (
                <Player
                  url={playerHighlighted.url}
                  muted={playerHighlighted.muted}
                  playing={playerHighlighted.playing}
                  isActive={false}
                  me={false}
                />
              )}
          </div>
          <CopySection roomId={roomId} />
          <Bottom
            muted={playerHighlighted?.muted}
            playing={playerHighlighted?.playing}
            toggleAudio={toggleAudio}
            toggleVideo={toggleVideo}
            leaveRoom={leaveRoom}
            clickable={ref.current}
            players={players}
          />
        </>
      ) : (
        <div className=" w-[100vw] h-[100vh] z-10">
          {Object.keys(nonHighlightedPlayers).map((playerId) => {
            const { url, muted, playing } = nonHighlightedPlayers[playerId];
            return (
              <ReactPlayer
                key={playerId}
                url={url}
                muted={muted}
                playing={true}
                width="100%"
                height="100%"
                style={{ display: "none" }}
              />
            );
          })}

          <Menu />
          <Toolbox />
          <Board />
          <div className=" absolute top-5 right-2 lg:right-5">
            <Close />
          </div>
          <div>
            <CopySection roomId={roomId} />
          </div>
        </div>
      )}
    </>
  );
};

export default Room;
