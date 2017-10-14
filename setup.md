## Configuring SSH

Load raspbian onto SD card
boot into raspbian and configure internet settings
update apt-get ```sudo apt-get- update``` --This will take awhile (15 minutes)
upgrade apt-get ```sudo apt-get upgrade```
install avahi-daemon to expose hostname ```sudo apt-get install avahi-daemon```
change hostname to echomote ```sudo nano /etc/hostname``` edit the file to echomote ```sudo /etc/init.d/hostname.sh``` ```sudo reboot```
now you can ssh into pi using pi@echomote.local

## Configuring SSH VScode Tunneling
using: https://codepen.io/ginfuru/post/remote-editing-files-with-ssh

install rmate: ```sudo wget -O /usr/local/bin/rcode https://raw.github.com/aurora/rmate/master/rmate``` ```sudo chmod a+x /usr/local/bin/rcode```
add alias: ```sudo nano .bashrc``` and add ```alias code='rcode'```
export the path: ```sudo echo "export PATH=\"$PATH:/usr/local/bin\"" >> /etc/profile```

## Install GIT and pull down the project
```sudo apt-get install git```
```git --version```

## Install Node
```sudo apt-get install node```
```node -v```