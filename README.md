# CS:GO Autodemo

This small tray app allows you to automatically record demos of all your CS:GO games.<br/>
You don't have to configure anything, just run it once and you are good to go!<br/>. You have to only close Steam before the first run.
Demos will appear at `steamapps/common/Counter-Strike Global Offensive/csgo/autodemo` with date, map and game mode in the filename.

## Why?

MM demos are saved on Valve servers for some time and that's great!
But if you also play with friends/non-ranked/other game modes and want to be sure that your super-duper ace is preserved for the generations to come - this is the app.

## How does it work?

It relies on the [Game State Integration](https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Game_State_Integration) mechanism
for keeping track of the game state and
on the [remote access](https://developer.valvesoftware.com/wiki/Command_Line_Options#Linux_Command_Options_in_Left_4_Dead_series) to CS:GO console
via telnet for demos recording/stopping.

On the first launch it locates your CS:GO installtion and places a `.cfg` file there which enables GSI.
It also modifies a `localconfig.vdf` file to add a `-netconport ` launch option for the telnet connetion to the CS:GO console.
And finally it registers itslef to start automatically at OS login. Steam needs to be closed before first setup, because `localconfig.vdf` is overriden with in-memory state while Steam is opened.

Then app runs in the background waiting for the telnet connection to CS:GO and responding to GSI events about round/map changes. When you enter new map it starts the demo and when the game ends - it's stops recording.
