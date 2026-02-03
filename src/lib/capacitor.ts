import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType } from '@capacitor/camera';

export const isNative = Capacitor.isNativePlatform();

export const hapticImpact = async (style: ImpactStyle = ImpactStyle.Light) => {
    if (isNative) {
        await Haptics.impact({ style });
    }
};

export const getCurrentPosition = async () => {
    if (isNative) {
        const coordinates = await Geolocation.getCurrentPosition();
        return coordinates.coords;
    } else {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve(pos.coords),
                (err) => reject(err)
            );
        });
    }
};

export const takePicture = async () => {
    if (isNative) {
        const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: true,
            resultType: CameraResultType.Uri
        });
        return image.webPath;
    }
    return null;
};
