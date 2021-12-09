let codecString = "vp8";

function reportError(e) {
    // Report error to the main thread
    console.log(e.message)
    postMessage(e.message);
}

function captureAndEncode(frame_source, width, height, fps, processChunk) {
    let frameCounter = 0;

    const init = {
        output: processChunk,
        error: reportError
    };

    const config = {
        codec: codecString,
        width,
        height,
        displayWidth: width,
        displayHeight: height,
        bitrate: 10000000,
        framerate: fps,
    };

    let encoder = new VideoEncoder(init);
    encoder.configure(config);

    let reader = frame_source.getReader();
    async function readFrame() {
        const result = await reader.read();
        let frame = result.value;

        if (encoder.encodeQueueSize < 2) {
            frameCounter++;
            const insert_keyframe = (frameCounter % 130) == 0;
            encoder.encode(frame, { keyFrame: insert_keyframe });
            frame.close();
        } else {
            // Too many frames in flight, encoder is overwhelmed
            // let's drop this frame.        
            console.log("dropping a frame");
            frame.close();
        }

        setTimeout(readFrame, 1);
    };

    readFrame();
}

function startDecoding(writer) {
    let frameWriter = writer.getWriter();

    function handleFrame(frame) {
        frameWriter.write(frame);
        frame.close();
    }

    const init = {
        output: handleFrame,
        error: reportError
    };

    let decoder = new VideoDecoder(init);
    return decoder;
}

function main(frame_source, writer, width, height, fps) {
    let decoder = startDecoding(writer);
    function processChunk(chunk, md) {
        let config = md.decoderConfig;
        if (config) {
            console.log("decoder reconfig");
            decoder.configure(config);
        }

        decoder.decode(chunk);
    }
    captureAndEncode(frame_source, width, height, fps, processChunk);
}

self.onmessage = async function (e) {
    let frame_source = e.data.frame_source;
    let constrains = e.data.constrains;
    let writer = e.data.writer;
    let fps = e.data.fps;

    main(frame_source, writer, constrains.width, constrains.height, fps);
}