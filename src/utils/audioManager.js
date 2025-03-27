import { Howl, Howler } from 'howler'; // Import Howler

let desiredBgmVolume = 0.5; // 기본 BGM 볼륨 (let으로 변경)
let desiredSfxVolume = 0.8; // 기본 SFX 볼륨 (let으로 변경)

// --- BGM 정의 ---
const bgmTracks = {
  mainTheme: new Howl({
    src: ['/audio/Forest - Under The Great Tree (Extended).ogg'], // 경로 확인!
    loop: true,
    volume: 0, // 시작 볼륨 0
    autoplay: false, // 자동 재생은 명시적으로 false 권장
  }),
};

// --- SFX 정의 ---
const sfxSounds = {
  // 'click' 효과음 추가 (또는 사용하려는 이름으로 변경)
  click: new Howl({
    src: ['/audio/click.wav'], // 예시 경로, 실제 파일 필요!
    volume: desiredSfxVolume,
  }),
  enemyAttack: new Howl({
    src: ['/audio/EnemyAttack.wav'],
    volume: desiredSfxVolume,
  }),
};

// --- 상태 변수 ---
let currentBgm = null;
let isMutedForAutoplay = true; // 자동재생 위한 음소거 상태

// --- 함수 정의 ---
export const playBgm = (trackName) => {
  const track = bgmTracks[trackName];
  if (!track) {
    console.warn(`BGM 트랙 "${trackName}"을 찾을 수 없습니다.`);
    return;
  }

  if (currentBgm && currentBgm !== track) {
    // 기존 BGM 페이드 아웃 및 정지
    console.log(`Switching BGM from ${currentBgm._src} to ${track._src}`);
    const previousBgm = currentBgm; // Store previous BGM

    // Fade out and stop previous BGM if it exists and is different
    if (previousBgm && previousBgm !== track) {
        console.log(`Switching BGM from ${previousBgm._src} to ${track._src}. Fading out and stopping previous.`);
        previousBgm.off('fade'); // Remove previous listeners
        previousBgm.fade(previousBgm.volume(), 0, 500); // Start fade out
        // Stop the previous track shortly after starting fade, avoiding complex callbacks
        setTimeout(() => {
             // Check if it's still the previous track before stopping
             // (Ensure currentBgm hasn't changed back in the meantime)
             if (currentBgm !== previousBgm) {
                 console.log(`Stopping previous BGM ${previousBgm?._src} after short delay.`);
                 previousBgm?.stop();
             } else {
                 console.log(`Not stopping previous BGM ${previousBgm?._src} as it became current again.`);
             }
        }, 550); // Slightly longer than fade duration (500ms)
    }
  }

  // Set the new track as current *before* manipulating it
  currentBgm = track;

  // Play/Fade logic for the *new* currentBgm
  if (!track.playing()) {
    const startVolume = isMutedForAutoplay ? 0 : desiredBgmVolume;
    // Ensure previous fade listeners are removed before playing/fading the new track
    track.off('fade');
    track.volume(startVolume);
    track.play();
    console.log(`${trackName} BGM 재생 시작 (볼륨: ${startVolume})`);
    if (!isMutedForAutoplay && startVolume === 0) {
        console.log('playBgm: Not muted, starting fade-in immediately.');
        track.fade(0, desiredBgmVolume, 1000);
    }
  } else { // Track is already playing
      track.off('fade'); // Ensure previous fade listeners removed
      if (isMutedForAutoplay && track.volume() > 0) {
          // If muted state is needed but track is playing with volume, force volume to 0
          track.volume(0);
          console.log('playBgm: Muted state enforced, setting volume to 0.');
      } else if (!isMutedForAutoplay && track.volume() < desiredBgmVolume) {
          // If not muted, playing, but volume is low (e.g., interrupted fade), restart fade-in
          console.log('playBgm: Not muted, already playing but volume low, attempting fade-in.');
          track.fade(track.volume(), desiredBgmVolume, 1000);
      } else if (!isMutedForAutoplay && track.volume() === desiredBgmVolume) {
          // If not muted and already at desired volume, do nothing
          console.log('playBgm: Not muted, already playing at desired volume.');
      }
  }
};

// 상호작용 발생 시 호출되는 함수 (AudioContext 재개 및 플래그 변경)
export const signalInteraction = () => {
  if (isMutedForAutoplay) {
    console.log("사용자 상호작용 감지됨, 자동재생 음소거 해제 시도");
    // 오디오 컨텍스트 재개 시도 (Howler 전역 객체 사용)
    Howler.ctx?.resume().then(() => {
        console.log("AudioContext resumed successfully.");
        isMutedForAutoplay = false; // 컨텍스트 재개 성공 시 플래그 변경

        // 현재 BGM 상태 초기화 및 페이드 인 시작 (더욱 안정적인 방식)
        if (currentBgm) {
            console.log('signalInteraction: Resumed. Resetting BGM state and starting fade-in.');
            currentBgm.stop(); // 이전 상태/페이드 완전 중지
            currentBgm.play(); // 재생 다시 시작
            currentBgm.volume(0); // 볼륨 0에서 시작 보장
            // fade 콜백은 여기서 등록하지 않음 (필요 시 별도 로직 추가)
            currentBgm.fade(0, desiredBgmVolume, 1000); // 페이드 인 시작
        } else {
            console.log('signalInteraction: Resumed, but no current BGM found.');
        }
    }).catch(e => console.error("Error resuming AudioContext:", e));
    // 만약 아직 currentBgm 재생 시작 전이었다면, 다음에 playBgm 호출 시 반영됨
  }
};

export const stopBgm = () => {
  // This function is primarily called on component unmount in Strict Mode.
  // We just want to ensure the sound fades out and the state is ready for the next mount.
  if (currentBgm) {
    console.log(`Fading out BGM: ${currentBgm._src} due to stopBgm call (e.g., unmount).`);
    currentBgm.off('fade'); // Remove any previous listeners, including the one added in playBgm
    currentBgm.fade(currentBgm.volume(), 0, 500); // Start fade out
    // Do NOT stop() or nullify currentBgm here. Let playBgm handle transitions.
    // Do NOT register a once('fade') callback here, as it causes issues with Strict Mode remounting.
  } else {
    console.log("stopBgm called but no BGM was playing.");
  }
  // Always ensure muted state for the next potential autoplay (Strict Mode).
  isMutedForAutoplay = true;
  console.log("stopBgm: Ensuring muted state for next autoplay attempt.");
};

export const playSfx = (soundName) => {
  const sound = sfxSounds[soundName];
  if (sound) {
    sound.play(); // 간단하게 그냥 재생
  } else {
    console.warn(`효과음 "${soundName}"을 찾을 수 없습니다.`);
  }
};

// --- 새로운 전역 볼륨 조절 함수들 ---

// 외부에서 BGM 볼륨을 설정하는 함수
export const setAudioManagerBgmVolume = (volume) => {
  const newVolume = Math.max(0, Math.min(1, volume)); // 0과 1 사이로 제한
  desiredBgmVolume = newVolume; // 목표 볼륨 업데이트
  console.log(`Desired BGM Volume set to: ${newVolume}`);
  // 현재 재생 중이고, 자동재생 음소거 상태가 아닐 때만 즉시 볼륨 적용
  if (currentBgm && !isMutedForAutoplay) {
    // 진행 중인 페이드가 있다면 중지하고 새 볼륨 적용
    currentBgm.off('fade');
    currentBgm.volume(newVolume);
    console.log(`Applied BGM Volume immediately: ${newVolume}`);
  } else if (currentBgm && isMutedForAutoplay) {
    console.log('BGM Volume changed, but currently muted for autoplay.');
    // 음소거 상태일 때는 desiredBgmVolume만 업데이트하고,
    // signalInteraction 시 playBgm 내부 로직이 desiredBgmVolume을 사용함.
    // 또는 여기서 currentBgm.volume(0)을 명시적으로 설정할 수도 있음 (현재 playBgm 로직과 일관성 유지)
    currentBgm.volume(0); // 음소거 상태 유지
  }
};

// 외부에서 SFX 볼륨을 설정하는 함수
export const setAudioManagerSfxVolume = (volume) => {
  const newVolume = Math.max(0, Math.min(1, volume)); // 0과 1 사이로 제한
  desiredSfxVolume = newVolume; // 목표 볼륨 업데이트
  // 로드된 모든 SFX 사운드의 볼륨을 즉시 변경
  Object.values(sfxSounds).forEach(sound => {
    sound.volume(newVolume);
  });
  console.log(`SFX Volume set to: ${newVolume}`);
};

// 기존의 개별 볼륨 조절 함수는 제거합니다.
