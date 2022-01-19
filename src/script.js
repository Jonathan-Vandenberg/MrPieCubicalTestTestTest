import './style.css'
import * as dat from 'lil-gui'
import * as THREE from 'three'
import { MapControls, OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { CameraHelper, WebGLRenderer } from 'three'
import { gsap } from 'gsap'


// const SPECTOR = require('spectorjs')
// const spector = new SPECTOR.Spector()
// spector.displayUI()



/**
 * Base
 */
// Debug
// const gui = new dat.GUI({
//     width: 400
// })


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
// scene.background = new THREE.Color("rgb(245,182,51)" );


//* Overlay Loading
const overlayGeometry = new THREE.PlaneBufferGeometry(2,2,1,1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms:
    {
        uAlpha: { value: 1 }
    },
    vertexShader: `
    void main()
    {
        gl_Position = vec4(position, 1.0);
    }
    `,
    fragmentShader: `
    uniform float uAlpha;

    void main()
    {
        gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
    }`
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)

/**
 * Loading screen 
 */

const loadingManager = new THREE.LoadingManager(
    () => 
    // Loaded
    {
        gsap.delayedCall(3, () => 
        {
            gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 4, value: 0})
        })
        
    }
    
)

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader(loadingManager)

// Draco loader
const dracoLoader = new DRACOLoader(loadingManager)
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

//* TEXTURES
const bakedTexture = textureLoader.load('baked.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding //* input as sRGB


//* MATERIALS
// Baked Material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture})



//* MODEL
gltfLoader.load(
    'mrPieCubicle.glb',
    (gltf) =>
    {
        gltf.scene.traverse((child) => 
        {
            child.material = bakedMaterial
        })

        scene.add(gltf.scene)
    
    
    }
    
)

/**
 * Sizes
 */
// //resize
//  //Resize
//        if (resizeRendererToDisplaySize(renderer)) {
//       const canvas = renderer.domElement;
//       camera.aspect = canvas.clientWidth / canvas.clientHeight;
//       camera.updateProjectionMatrix();
//     }

//     function resizeRendererToDisplaySize(renderer) {
//     const canvas = renderer.domElement;
//     const width = canvas.clientWidth;
//     const height = canvas.clientHeight;
//     const needResize = canvas.width !== width || canvas.height !== height;
//     if (needResize) {
//       renderer.setSize(width, height, false);
//     }
//     return needResize;
//   }

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}


window.addEventListener('resize', () =>
{
     // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
     // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
     // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 9
camera.position.y = 0
camera.position.z = 0
camera.rotateY(Math.PI * 0.559)
// const helper = new THREE.CameraHelper( camera );
// scene.add( helper );
scene.add(camera)

// Device type



// const deviceType = null

    const getDeviceType = () => {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return "tablet";
        }
        if (
            /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
                ua
            )
        ) {
            return "mobile";
        }
        return "desktop";
    }

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true

})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding //* Output sRGB encoding

 


// Scroll Down Desktop
window.addEventListener('wheel', onMouseWheel)
let y = 0
let position = 0
function onMouseWheel(event)
{
    y = event.deltaY * 0.0015
}


/**
 *  Animate
*/

const clock = new THREE.Clock()

const tick1 = () =>
{
    const elapsedTime = clock.getElapsedTime()
   

    //Camera position Y
    position += y
    y *= 0.9
    camera.position.y = -position
    
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick1)
}


const tick2 = () =>
{
    const elapsedTime = clock.getElapsedTime()


    // Mobile controls
    controls.update()
    
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick2)
}

 // Desktop Controls
            if(getDeviceType() === 'desktop')
        {
            
            tick1()
            controls.enabled = false
            controls.enableDamping = false
            controls.screenSpacePanning = false
        }

     // Scroll Down Mobile
const controls = new MapControls(camera, canvas)
controls.enableDamping = true
controls.screenSpacePanning = true
controls.enableRotate = false

// Mobile Controls
        if(getDeviceType() === 'mobile' || 'tablet')
        {
            tick2()
        }



