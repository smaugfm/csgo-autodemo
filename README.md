# CS:GO Autodemo
This small tray app allows you to automatically record demos of all your CS:GO games.<br/>
You don't have to configure anything, just run it once and you are good to go!<br/>
The demos will appear at `steamapps/common/Counter-Strike Global Offensive/csgo/autodemo`

## How does it work?
It relies on the [Game State Integration](https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Game_State_Integration) mechanism 
for keeping track of the game state and 
on the [remote access](https://developer.valvesoftware.com/wiki/Command_Line_Options#Linux_Command_Options_in_Left_4_Dead_series) to CS:GO console 
via telnet for demos recording/stopping.

On the first launch it locates your CS:GO installtion and places a `.cfg` file there which enables GSI. 
It also modifies a `*.vdf` file to add a `-netconport ` launch option for the telnet connetion to the CS:GO console.
And finally it registers itslef to start automatically at OS login.
