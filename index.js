const { Plugin } = require('powercord/entities');
const { ContextMenu: { Button } } = require('powercord/components');
const { getModuleByDisplayName, React } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { clipboard } = require('electron')
const { extname } = require('path');
const { parse } = require('url');
const { get } = require('powercord/http');

module.exports = class MemeStealer extends Plugin {
    startPlugin () {
        this.injectMemeStealer();
    }

    async injectMemeStealer() {
        const stealMeme = async (target) => {
            let regex = /(https?):\/\/(?:([\w-]+)\.)?([\w-]+)\.(\w+)((?:\/[\w-]+)*\/)([\w-]+)+\.([\w]+)/
            let match = regex.exec(target.src)
            let cdnUrl = `https://cdn.discordapp.com${match[5] + match[6]}.${match[7]}`
            const nativeImage = require('electron').nativeImage
            let dataURL = await this.getImageEncoded(cdnUrl)
            let image = nativeImage.createFromDataURL(dataURL);

            clipboard.writeImage(image)
        };

        const MessageContextMenu = await getModuleByDisplayName('MessageContextMenu');

        const handleImageContext = function (args, res) {
            const { target } = this.props;
      
            if (target.tagName.toLowerCase() === 'img' && target.parentElement.classList.contains('pc-imageWrapper')) {
              if (typeof res.props.children === 'object') {
                const children = [];
                children.push(res.props.children);
      
                res.props.children = children;
              }
      
              res.props.children.push(
                React.createElement(Button, {
                  name: 'Steal Meme',
                  seperate: true,
                  onClick: () => stealMeme(target)
                })
              );
            }
      
            return res;
          };
      
          inject('meme-stealer-imageContext', MessageContextMenu.prototype, 'render', handleImageContext);
    }

    getExtension (url) {
        return extname(parse(url).pathname).substring(1);
    }
    
    async getImageEncoded (imageUrl) {
        let extension = this.getExtension(imageUrl);
        const { raw } = await get(imageUrl);

        if(extension === 'jpg') {
            extension = 'jpeg';
        }
    
        return `data:image/${extension};base64,${raw.toString('base64')}`;
    }

    pluginWillUnload () {
        uninject('meme-stealer-imageContext');
    }
}