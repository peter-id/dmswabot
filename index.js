/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
const { create, Client } = require('@open-wa/wa-automate')
const figlet = require('figlet')
const options = require('./utils/options')
const { color, messageLog } = require('./utils')
const HandleMsg = require('./HandleMsg')

const start = (peter = new Client()) => {
    console.log(color(figlet.textSync('----------------', { horizontalLayout: 'default' })))
    console.log(color(figlet.textSync('peter.id', { font: 'Ghost', horizontalLayout: 'default' })))
    console.log(color(figlet.textSync('----------------', { horizontalLayout: 'default' })))
    console.log(color('[INIT]'), color('Initializing peter.id BOT', 'yellow'))
    console.log(color('[~>>]'), color('peter.id BOT Started!', 'green'))

    // Mempertahankan sesi agar tetap nyala
    peter.onStateChanged((state) => {
        console.log(color('[~>>]', 'red'), state)
        if (state === 'CONFLICT' || state === 'UNLAUNCHED') peter.forceRefocus()
    })

    // ketika bot diinvite ke dalam group
    peter.onAddedToGroup(async (chat) => {
        const groups = await peter.getAllGroups()
        // kondisi ketika batas group bot telah tercapai,ubah di file settings/setting.json
        if (groups.length > groupLimit) {
            await peter.sendText(chat.id, `Sorry, the group on this bot is full\nMax Group is: ${groupLimit}`).then(() => {
	      peter.leaveGroup(chat.id)
	      peter.deleteChat(chat.id)
	  })
        } else {
            // kondisi ketika batas member group belum tercapai, ubah di file settings/setting.json
	    if (chat.groupMetadata.participants.length < memberLimit) {
	    await peter.sendText(chat.id, `Sorry, BOT comes out if the group members do not exceed ${memberLimit} people`).then(() => {
	      peter.leaveGroup(chat.id)
	      peter.deleteChat(chat.id)
	    })
	    } else {
                await peter.simulateTyping(chat.id, true).then(async () => {
                    await peter.sendText(chat.id, `Hai minna~, Im peter.id BOT. To find out the commands on this bot type ${prefix}menu`)
                })
	    // eslint-disable-next-line no-mixed-spaces-and-tabs
	    }
        }
    })

    // ketika seseorang masuk/keluar dari group
    peter.onGlobalParicipantsChanged(async (event) => {
        const host = await peter.getHostNumber() + '@c.us'
        // kondisi ketika seseorang diinvite/join group lewat link
        if (event.action === 'add' && event.who !== host) {
            await peter.sendTextWithMentions(event.chat, `Hello, Welcome to the group @${event.who.replace('@c.us', '')} \n\nHave fun with us✨`)
        }
        // kondisi ketika seseorang dikick/keluar dari group
        if (event.action === 'remove' && event.who !== host) {
            await peter.sendTextWithMentions(event.chat, `Good bye @${event.who.replace('@c.us', '')}, We'll miss you✨`)
        }
    })

    peter.onIncomingCall(async (callData) => {
        // ketika seseorang menelpon nomor bot akan mengirim pesan
        await peter.sendText(callData.peerJid, 'Maaf sedang tidak bisa menerima panggilan.\n\n-bot')
            .then(async () => {
            // bot akan memblock nomor itu
                await peter.contactBlock(callData.peerJid)
            })
    })

    // ketika seseorang mengirim pesan
    peter.onMessage(async (message) => {
        peter.getAmountOfLoadedMessages() // menghapus pesan cache jika sudah 3000 pesan.
            .then((msg) => {
                if (msg >= 3000) {
                    console.log('[peter]', color(`Loaded Message Reach ${msg}, cutting message cache...`, 'yellow'))
                    peter.cutMsgCache()
                }
            })
        HandleMsg(peter, message)
    })

    // Message log for analytic
    peter.onAnyMessage((anal) => { 
        messageLog(anal.fromMe, anal.type)
    })
}

// create session
create(options(true, start))
    .then((peter) => start(peter))
    .catch((err) => new Error(err))