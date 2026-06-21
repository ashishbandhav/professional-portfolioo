import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { eyebrowBoneNames, typingBoneNames } from "../../../data/boneData";

const setAnimations = (gltf: GLTF) => {
  let character = gltf.scene;
  let mixer = new THREE.AnimationMixer(character);
  let typingTimer: any = null;
  if (gltf.animations) {
    const introClip = gltf.animations.find(
      (clip) => clip.name === "introAnimation"
    );
    const introAction = mixer.clipAction(introClip!);
    introAction.setLoop(THREE.LoopOnce, 1);
    introAction.clampWhenFinished = true;
    introAction.play();
    const clipNames = ["key1", "key2", "key5", "key6"];
    clipNames.forEach((name) => {
      const clip = THREE.AnimationClip.findByName(gltf.animations, name);
      if (clip) {
        const action = mixer?.clipAction(clip);
        action!.play();
        action!.timeScale = 1.2;
      } else {
        console.error(`Animation "${name}" not found`);
      }
    });
    let typingAction: THREE.AnimationAction | null = null;
    typingAction = createBoneAction(gltf, mixer, "typing", typingBoneNames);
    if (typingAction) {
      typingAction.enabled = true;
      typingAction.play();
      typingAction.timeScale = 1.2;
      // If typing continues for a while, trigger stand-and-bow
      try {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
          performStandAndBow();
        }, 8000);
      } catch (e) {}
    }
  }
  function startIntro() {
    const introClip = gltf.animations.find(
      (clip) => clip.name === "introAnimation"
    );
    const introAction = mixer.clipAction(introClip!);
    introAction.clampWhenFinished = true;
    introAction.reset().play();
    setTimeout(() => {
      const blink = gltf.animations.find((clip) => clip.name === "Blink");
      mixer.clipAction(blink!).play().fadeIn(0.5);
    }, 2500);
  }
  // Log all mesh names for debugging
  function logMeshNames() {
    const meshes: string[] = [];
    character.traverse((child: any) => {
      if (child.isMesh) {
        meshes.push(child.name);
      }
    });
    console.log("Available meshes:", meshes);
  }

  // Apply white shirt, tie, black pants outfit
  function applyWhiteShirtBlackPantsOutfit() {
    character.traverse((child: any) => {
      if (!child.isMesh || !child.material) return;
      const name = (child.name || "").toLowerCase();
      
      // White shirt/top
      if (name.includes("shirt") || name.includes("top") || name.includes("torso_cloth") || name.includes("chest")) {
        const mat: any = child.material;
        if (mat.color) {
          mat.color = new THREE.Color("#FFFFFF"); // White
          mat.needsUpdate = true;
        }
      }
      // Black pants
      else if (name.includes("pant") || name.includes("leg") || name.includes("lower") || name.includes("bottom")) {
        const mat: any = child.material;
        if (mat.color) {
          mat.color = new THREE.Color("#000000"); // Black
          mat.needsUpdate = true;
        }
      }
      // Tie (dark color)
      else if (name.includes("tie") || name.includes("neck")) {
        const mat: any = child.material;
        if (mat.color) {
          mat.color = new THREE.Color("#1a1a1a"); // Dark
          mat.needsUpdate = true;
        }
      }
    });
  }

  // change clothing color to given hex (applies to meshes with clothing-related names)
  function changeClothesColor(colorHex: string) {
    const clothingKeywords = [
      "jacket",
      "coat",
      "blazer",
      "shirt",
      "torso",
      "clothes",
      "top",
      "outer",
    ];
    character.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const name = (child.name || "").toLowerCase();
        if (clothingKeywords.some((k) => name.includes(k))) {
          const mat: any = child.material;
          if (mat.color) {
            mat.color = new THREE.Color(colorHex);
            mat.needsUpdate = true;
          }
        }
      }
    });
  }

  // Perform stand then bow sequence with proper greeting outfit
  function performStandAndBow() {
    // Apply proper outfit (white shirt, black pants, tie)
    applyWhiteShirtBlackPantsOutfit();

    // Stop typing animation if playing
    const typingClip = THREE.AnimationClip.findByName(gltf.animations, "typing");
    if (typingClip) {
      const typingAction = mixer.clipAction(typingClip);
      typingAction.stop();
    }

    const standClip = THREE.AnimationClip.findByName(gltf.animations, "stand");
    const bowClip = THREE.AnimationClip.findByName(gltf.animations, "bow");
    
    const playClip = (clip: THREE.AnimationClip | null) => {
      return new Promise<void>((resolve) => {
        if (clip) {
          const action = mixer.clipAction(clip);
          action.reset();
          action.setLoop(THREE.LoopOnce, 1);
          action.clampWhenFinished = true;
          action.play();
          // Wait for animation to complete
          setTimeout(() => resolve(), (clip.duration || 1) * 1000 + 200);
        } else {
          resolve();
        }
      });
    };

    // Run animations sequentially
    (async () => {
      // Try to play stand animation
      if (standClip) {
        await playClip(standClip);
      }
      
      // Then try to play bow animation
      if (bowClip) {
        await playClip(bowClip);
      }
    })();
  }
  function hover(gltf: GLTF, hoverDiv: HTMLDivElement) {
    let eyeBrowUpAction = createBoneAction(
      gltf,
      mixer,
      "browup",
      eyebrowBoneNames
    );
    let isHovering = false;
    if (eyeBrowUpAction) {
      eyeBrowUpAction.setLoop(THREE.LoopOnce, 1);
      eyeBrowUpAction.clampWhenFinished = true;
      eyeBrowUpAction.enabled = true;
    }
    const onHoverFace = () => {
      if (eyeBrowUpAction && !isHovering) {
        isHovering = true;
        eyeBrowUpAction.reset();
        eyeBrowUpAction.enabled = true;
        eyeBrowUpAction.setEffectiveWeight(4);
        eyeBrowUpAction.fadeIn(0.5).play();
      }
    };
    const onLeaveFace = () => {
      if (eyeBrowUpAction && isHovering) {
        isHovering = false;
        eyeBrowUpAction.fadeOut(0.6);
      }
    };
    if (!hoverDiv) return;
    hoverDiv.addEventListener("mouseenter", onHoverFace);
    hoverDiv.addEventListener("mouseleave", onLeaveFace);
    return () => {
      hoverDiv.removeEventListener("mouseenter", onHoverFace);
      hoverDiv.removeEventListener("mouseleave", onLeaveFace);
    };
  }
  return { mixer, startIntro, hover, changeClothesColor, performStandAndBow, logMeshNames, applyWhiteShirtBlackPantsOutfit };
};

const createBoneAction = (
  gltf: GLTF,
  mixer: THREE.AnimationMixer,
  clip: string,
  boneNames: string[]
): THREE.AnimationAction | null => {
  const AnimationClip = THREE.AnimationClip.findByName(gltf.animations, clip);
  if (!AnimationClip) {
    console.error(`Animation "${clip}" not found in GLTF file.`);
    return null;
  }

  const filteredClip = filterAnimationTracks(AnimationClip, boneNames);

  return mixer.clipAction(filteredClip);
};

const filterAnimationTracks = (
  clip: THREE.AnimationClip,
  boneNames: string[]
): THREE.AnimationClip => {
  const filteredTracks = clip.tracks.filter((track) =>
    boneNames.some((boneName) => track.name.includes(boneName))
  );

  return new THREE.AnimationClip(
    clip.name + "_filtered",
    clip.duration,
    filteredTracks
  );
};

export default setAnimations;
