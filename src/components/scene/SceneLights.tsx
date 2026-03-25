export function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <hemisphereLight intensity={0.45} color="#f8fbff" groundColor="#b9c7d6" />
      <directionalLight
        position={[2.8, 4, 3.5]}
        intensity={1.3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </>
  );
}
