import { useCallback, useEffect, useState } from "react";
import type { Container, Engine } from "@tsparticles/engine";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles"; // if you are going to use `loadFull`, install the "tsparticles" package too.
import { loadSlim } from "@tsparticles/slim"; // if you are going to use `loadSlim`, install the "@tsparticles/slim" package too.

export const BookOfParticles = () => {
  const [init, setInit] = useState(false);

  // this should be run only once per application lifetime
  const startParticles = useCallback(() => {
    initParticlesEngine(async (engine) => {
      // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      //await loadAll(engine);
      //await loadFull(engine);
      await loadFull(engine);
      //await loadBasic(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  useEffect(() => {
    startParticles();
  }, []);

  const particlesLoaded = (
    container?: Container | undefined
  ): Promise<void> => {
    console.log(container);
    return Promise.resolve();
  };

  return (
    <>
      {init && (
        <Particles
          id="tsparticles"
          particlesLoaded={particlesLoaded}
          options={{
            fullScreen: { enable: true, zIndex: -3 },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: {
                  enable: true,
                  mode: "push",
                },
                onHover: {
                  enable: true,
                  mode: "repulse",
                },
              },
              modes: {
                push: {
                  quantity: 4,
                },
                repulse: {
                  distance: 200,
                  duration: 0.4,
                },
              },
            },
            particles: {
              color: {
                value: "#000000",
              },
              move: {
                direction: "none",
                enable: true,
                outModes: {
                  default: "out",
                },
                random: false,
                speed: 4,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                },
                value: 60,
              },
              opacity: {
                value: { min: 0.5, max: 0.7 },
              },
              shape: {
                type: "emoji",
                options: {
                  emoji: {
                    value: ["🥨", "🍕", "🥞", "🍝", "🥜"],
                  },
                },
              },
              size: {
                value: { min: 10, max: 15 },
              },
            },
            detectRetina: true,
          }}
        />
      )}
    </>
  );
};
