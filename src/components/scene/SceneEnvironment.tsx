import { Grid } from "@react-three/drei";

export function SceneEnvironment() {
  return (
    <>
      <Grid
        args={[12, 12]}
        position={[0, 0, 0]}
        cellColor="#8aa2bb"
        sectionColor="#5e7893"
        fadeDistance={18}
        fadeStrength={1}
        infiniteGrid
      />
    </>
  );
}
