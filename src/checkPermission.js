import { readFile } from 'fs';

const hasPermissionChannel = async (guildId, channelId, cb) => {
    let permission = false;
    readFile(
        '.\\data\\channels.json',
        'utf8',
        (err, data) => {
            if (err) {
                console.error("Error: File read failed:", err);
                return permission;
            } else {
                const obj = JSON.parse(data);
                obj.guilds.forEach(element => {

                    if (element.id === guildId) {

                        if (element.channels.length === 0) {
                            permission = true;
                            return;
                        }

                        if (element.channels.includes(channelId)) {
                            permission = true;
                        }
                    }
                });

                if (permission) {
                    cb();
                }
            }
        }
    )
    return permission;
};

export { hasPermissionChannel };