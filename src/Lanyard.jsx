/* eslint-disable react/no-unknown-property */
import React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, useTexture } from '@react-three/drei'
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint
} from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import * as THREE from 'three'
import './Lanyard.css'

extend({ MeshLineGeometry, MeshLineMaterial })

const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

export default function Lanyard({
  position = [0, 0, 24],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 0.74,
  cardScale = 1.8
}) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="lanyard-wrapper" aria-label="可拖拽个人吊牌">
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.15 : 1.5]}
        gl={{ alpha: transparent, antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI * 0.75} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            isMobile={isMobile}
            frontImage={frontImage}
            backImage={backImage}
            imageFit={imageFit}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth}
            cardScale={cardScale}
          />
        </Physics>
        <Environment blur={0.65}>
          <Lightformer intensity={2.4} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[80, 0.1, 1]} />
          <Lightformer intensity={3.2} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[80, 0.1, 1]} />
          <Lightformer intensity={4} color="white" position={[4, 2, 5]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[80, 7, 1]} />
        </Environment>
      </Canvas>
    </div>
  )
}

function Band({
  maxSpeed = 48,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 0.74,
  cardScale = 1.8
}) {
  const band = useRef()
  const fixed = useRef()
  const j1 = useRef()
  const j2 = useRef()
  const j3 = useRef()
  const card = useRef()
  const vec = new THREE.Vector3()
  const ang = new THREE.Vector3()
  const rot = new THREE.Vector3()
  const dir = new THREE.Vector3()
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 }
  const frontTex = useTexture(frontImage || BLANK_PIXEL)
  const backTex = useTexture(backImage || frontImage || BLANK_PIXEL)
  const [strapTex, setStrapTex] = useState(null)
  const [curve] = useState(
    () => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  )
  const [dragged, drag] = useState(false)
  const [hovered, hover] = useState(false)

  const frontMap = useMemo(() => makeCardTexture(frontTex, imageFit), [frontTex, imageFit])
  const backMap = useMemo(() => makeCardTexture(backTex, imageFit), [backTex, imageFit])

  useEffect(() => {
    if (!lanyardImage) {
      setStrapTex(null)
      return undefined
    }

    let active = true
    const loader = new THREE.TextureLoader()
    loader.load(lanyardImage, texture => {
      if (!active) return
      texture.colorSpace = THREE.SRGBColorSpace
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      texture.needsUpdate = true
      setStrapTex(texture)
    })

    return () => {
      active = false
    }
  }, [lanyardImage])

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 2.5, 0]
  ])

  useEffect(() => {
    if (!hovered) return undefined
    document.body.style.cursor = dragged ? 'grabbing' : 'grab'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered, dragged])

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      ;[card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp())
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z })
    }

    if (!fixed.current || !band.current || !j1.current || !j2.current || !j3.current || !card.current) return

    ;[j1, j2].forEach(ref => {
      if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation())
      const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())))
      ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)))
    })
    curve.points[0].copy(j3.current.translation())
    curve.points[1].copy(j2.current.lerped)
    curve.points[2].copy(j1.current.lerped)
    curve.points[3].copy(fixed.current.translation())
    band.current.geometry.setPoints(curve.getPoints(isMobile ? 18 : 32))
    ang.copy(card.current.angvel())
    rot.copy(card.current.rotation())
    card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
  })

  curve.curveType = 'chordal'
  return (
    <>
      <group position={[0, 6.35, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.45, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0.9, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.35, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.85, -0.45, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.78, 1.08, 0.05]} />
          <group
            scale={cardScale}
            position={[0, -1.02, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={e => {
              e.target.releasePointerCapture(e.pointerId)
              drag(false)
            }}
            onPointerDown={e => {
              e.target.setPointerCapture(e.pointerId)
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            }}
          >
            <CardBody frontMap={frontMap} backMap={backMap} isMobile={isMobile} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="#174a2f"
          depthTest={false}
          resolution={isMobile ? [800, 1400] : [1200, 1000]}
          useMap={Boolean(lanyardImage)}
          map={strapTex || null}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  )
}

function CardBody({ frontMap, backMap, isMobile }) {
  return (
    <>
      <mesh>
        <boxGeometry args={[1.58, 2.18, 0.08]} />
        <meshPhysicalMaterial color="#f7faf7" clearcoat={isMobile ? 0 : 0.7} roughness={0.42} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[1.46, 2.02]} />
        <meshPhysicalMaterial map={frontMap} clearcoat={isMobile ? 0 : 0.75} clearcoatRoughness={0.16} roughness={0.68} />
      </mesh>
      <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -0.045]}>
        <planeGeometry args={[1.46, 2.02]} />
        <meshPhysicalMaterial map={backMap} clearcoat={isMobile ? 0 : 0.45} roughness={0.72} />
      </mesh>
      <mesh position={[0, 1.02, 0.07]}>
        <torusGeometry args={[0.18, 0.018, 16, 40]} />
        <meshStandardMaterial color="#d8ded9" metalness={0.7} roughness={0.22} />
      </mesh>
      <mesh position={[0, 1.17, 0.06]}>
        <boxGeometry args={[0.42, 0.12, 0.06]} />
        <meshStandardMaterial color="#174a2f" metalness={0.25} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.74, 0.065]}>
        <boxGeometry args={[0.07, 1.21, 0.045]} />
        <meshStandardMaterial color="#174a2f" metalness={0.18} roughness={0.38} />
      </mesh>
    </>
  )
}

function makeCardTexture(texture, imageFit) {
  if (!texture?.image) return texture

  const source = texture.image
  const canvas = document.createElement('canvas')
  canvas.width = 900
  canvas.height = 1240
  const ctx = canvas.getContext('2d')
  if (!ctx) return texture

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const scale = (imageFit === 'contain' ? Math.min : Math.max)(canvas.width / source.width, canvas.height / source.height)
  const dw = source.width * scale
  const dh = source.height * scale
  const dx = (canvas.width - dw) / 2
  const dy = (canvas.height - dh) / 2
  ctx.drawImage(source, dx, dy, dw, dh)

  const result = new THREE.CanvasTexture(canvas)
  result.colorSpace = THREE.SRGBColorSpace
  result.anisotropy = 16
  result.needsUpdate = true
  return result
}
