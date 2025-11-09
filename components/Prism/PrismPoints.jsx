import React,{useEffect} from "react";
import { Text } from "@react-three/drei";

const getColorFromRisk = (risk) => {
  switch (risk) {
    case "No Significant":
      return "green";
    case "Apparent Regressive":
      return "green";
    case "Creeping":
      return "yellow";
    case "Apparent Progressive":
      return "red";
    default:
      return "grey";
  }
};

const Prisms = ({ data }) => {


  return (
    <>
      {data.map((prism, index) => (
        <group key={index} position={[
          parseFloat(prism.x),
          parseFloat(prism.y),
          parseFloat(prism.z)
        ]}>
          <mesh>
            <sphereGeometry args={[5, 20, 20]} />
            <meshStandardMaterial color={getColorFromRisk(prism.risk)} />
          </mesh>
        
          {prism.id && (
            <Text
              position={[0, 5, 0]}
              fontSize={3}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {prism.id}
            </Text>
          )}
        </group>
      ))}
    </>
  );
};



export default Prisms;
