/**
 * Vector Screencast is a project developed as a bachelors thesis by Šimon Rozsíval at Mathematical and Physical faculty
 * of Charles University in Prague. It's goal is to create an open-source JavaScritp library, that will enable people
 * to create their own services around it.
 * 
 * Vector Screencast provides two tools: a **Recorder and a **Player**. 
 * 
 * -	**Recorder** captures user's input through a computer mouse, stylus or touchscreen and a microphone and stores this
 * 		information at the server. Recorder uses an algorhithm inspired by [DynaDraw](www.graficaobscura.com/dyna/) by Paul Haeberli
 * 		to render lines with variable thickness according to the speed of the cursor and the pressure on the screen when using
 * 		a compatible stylus and web browser. Recorder uploads all audio data to the server during the recording over a WebSocket.
 * 		A compatible server process must be running to record the audio.
 * 
 * -	**Player** downloads the data stored by the Recorder and plays them in the same way it was recorded. Audio, if any, is played along the animation. Player can be easily embedded into any website using an iframe.
 * 
 * @author Šimon Rozsíval <simon@roszival.com>
 * @prefered
 */
namespace VectorScreencast { }