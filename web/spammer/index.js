const path = require('path');
const readline = require('readline');


// Chrome
const puppeteer = require('puppeteer-core');
const  { 
    startBrowser,
} = require(path.join(__dirname, './functionPuppeteer.js'));


// DB
const sqlite3 = require("sqlite3").verbose();
const dbPath = './../db.sqlite3';
const  { 
  createDbConnection,
  selectStatus,
  selectAccount,
  selectInfo,
  selectRequiredUsers,
  insertUser,
  checkUser,
} = require(path.join(__dirname, 'functionDB.js'));


// Additional
url = 'https://web.telegram.org/a/'
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


index(1); // 1 - number of bot


async function index(number) {
  const db = await createDbConnection(dbPath, sqlite3);
  const account = await selectAccount(number, db);
  const page = await startBrowser(puppeteer);
  await autorization(page, account.phone, account.password);
  for (;;) {
    await waitStart(number, db);
    const info = await selectInfo(number, db);
    await spammRequired(page, info.text, info.server, db);
    try {
      await spammGroup(page, info.server, info.text, account.phone, db, number);
      // const status = await selectStatus(number, db);
      // if (status.status === 0) {break;}
    } catch (error) {
      console.log(error);
    }
  }
}

async function spammGroup(page, server, text, phone, db, number) {
  await enterInSearch(page, server);
  const status_group = await selectGroup(page, server);

  if (!status_group) {

    for (;;) {
      const comments_len = await buttonComment(page);
      console.log('Количество комментариев', comments_len.length);
      for (let i = 0; i < comments_len.length; i++) {
        const comments = await buttonComment(page);
        console.log('Номер коммента', i);
        const comment = comments[i]
        await comment.click();

        const users_len = await allUsers(page);
        console.log('Количество пользователей', users_len.length);
        for (let j = 0; j < users_len.length; j++) {
          const users = await allUsers(page);
          const user = users[j]

          try {
            const username = await user.evaluate(element => element.textContent);
            console.log(username);
            const exists = await checkUser(username, db);
            console.log(typeof exists);
            if (typeof exists === 'object') {
              await scrollPage(page);
              continue;
            }

            await insertUser(username, db)
          } catch (error) {
            console.log(error);
            continue;
          } 

          let status = await clickUser(user);
          if (!status) {
            await scrollPage(page);
            continue;
          }

          await writeMessageUser(page, text, phone, db);
          await clickBackButtonUser(page);

          status = await selectStatus(number, db);
          if (status.status === 0) {return;}
        }
        await clickBackButton(page);
        await page.waitForTimeout(1000);
      }

      console.log('Листаем группу');
      await scrollPage(page);
      await page.waitForTimeout(1000);
    }
  }
}

async function scrollPage(page) {
  const element = await page.$('.MessageList');

  if (element) {
    await page.evaluate((element) => {
      element.scrollBy({
        top: -1000,
        behavior: 'smooth',
      });
    }, element);
  }

  await page.waitForTimeout(1000);
}

async function autorization(page, phone, password) {
  await performLogin(page);
  await enterPhoneNumber(page, phone);
  await enterCode(page);
  await enterPassword(page, password);
}

async function spammRequired(page, text, server, db) {
  const infoUsers = await selectRequiredUsers(db);

  for (const infoUser of infoUsers) {
    await enterInSearch(page, infoUser.identification);
    const status = await selectUser(page, infoUser);
    if (!status) {continue}
    await writeMessage(page, text);
  }
}

async function clickPost(post) {
  const comment = await post.$('div.CommentButton');
  if (comment) {
    await comment.click();
    return true
  }
}

async function clickUser(user) {
  try {
    await user.click();
    return true
  } catch (error) {
    // console.log(error);
    return false
  }
}

async function waitStart(number, db) {
  for (;;) {
    const status = await selectStatus(number, db);
    if (status.status === 0) {
      console.log(`Status: 0. Wait for start.`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      console.log(`Status: 1. Bot activated!`);
      // await new Promise(resolve => setTimeout(resolve, 5000));
      return;
    }
  }
}

async function searchSections(page, selector) {
  await page.waitForSelector(selector);
  const sections = await page.$$(selector);
  await page.waitForTimeout(2000);
  console.log(searchSections.length);
  return sections
}

async function showMore(head, page, selector) {
  const showMore = await head.$(selector);
  if (showMore) {
    await showMore.click();
    console.log('Show More Click!');
    await page.waitForTimeout(3000);
  } else {
    console.log('Dont find show more');
  }
}

async function selectUser(page, user) {
  await page.waitForTimeout(3000);

  const sections = await searchSections(page, 'div.search-section');

  for (const section of sections) {
    const head = await section.$('h3.section-heading');
    const headText = await head.evaluate(element => element.innerText);
    console.log(headText);

    if (!head) {continue}

    await showMore(head, page, 'a');

    const chats = await section.$$('div.ChatInfo');
    for (const chat of chats) {
      if (headText.includes('Chats and Contacts')) {
        const name = await chat.$('h3');
        const nameText = await name.evaluate(element => element.textContent);
        
        console.log(nameText, user.identification, user.name);
        // console.log(nameText, user.name);
        if (nameText.includes(user.name)) {
          await name.click();
          return true
        }

        // console.log(nameText);
      } else {
        const nameH3 = await chat.$('h3');
        const nameH3Text = await nameH3.evaluate(element => element.textContent);

        const name = await chat.$('span.handle');
        const nameText = await name.evaluate(element => element.textContent);

        // const status = await chat.$('span.user-status');
        // if (status) {
        //   var statusText = await status.evaluate(element => element.textContent);
        // }

        if (nameH3Text.includes(user.name)) {
          await name.click();
          return true
        }
        else if (nameH3Text.includes(user.identification)) {
          await name.click();
          return true
        }
        else if (nameText.includes(user.identification)) {
          await name.click();
          return true
        }
        else if (nameText.includes(user.name)) {
          await name.click();
          return true
        }
        // console.log(nameText);
        // console.log(statusText);
      }
    }
  }
}

async function selectGroup(page, group) {
  await page.waitForTimeout(3000);

  const sections = await searchSections(page, 'div.search-section');

  for (const section of sections) {
    const head = await section.$('h3.section-heading');
    const headText = await head.evaluate(element => element.innerText);
    console.log(headText);

    if (!head) {continue}

    await showMore(head, page, 'a');

    const chats = await section.$$('div.ChatInfo');
    for (const chat of chats) {
      if (headText.includes('Chats and Contacts')) {
        const name = await chat.$('h3');
        const nameText = await name.evaluate(element => element.textContent);
        
        // console.log(nameText, user.name);
        if (nameText === group) {
          await name.click();
          return true
        }

        // console.log(nameText);
      } else {
        const name = await chat.$('span.handle');
        const status = await chat.$('span.user-status');
        const nameText = await name.evaluate(element => element.textContent);
        if (status) {
          var statusText = await status.evaluate(element => element.textContent);
        }

        // console.log(nameText, user.identification);
        if (nameText === group) {
          await name.click();
          return true
        }
        if (nameText === group) {
          await name.click();
          return true
        }
        // console.log(nameText);
        // console.log(statusText);
      }
    }
  }
}

async function allPosts(page) {
  await page.waitForTimeout(1000);
  await page.waitForTimeout('div.message-list-item');
  const allPosts = await page.$$('div.message-list-item');
  return allPosts
}

async function buttonComment(page) {
  await page.waitForTimeout(1000);
  await page.waitForTimeout('div.CommentButton');
  const allComment = await page.$$('div.CommentButton');
  return allComment
}

async function allUsers(page) {
  await page.waitForTimeout(5000);
  return await page.$$('span.message-title-name');
}

async function enterCode(page) {
  rl.question('Введите код: ', async (code) => {
    await enterCodeNumber(page, code);
  });
}

async function performLogin(page) {
  await page.click('button.Button');
  await page.waitForSelector('input#sign-in-phone-number');
  await page.focus('input#sign-in-phone-number');
  await selectAllAndDelete(page);
}

async function selectAllAndDelete(page) {
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Delete');
}

async function enterPhoneNumber(page, phoneNumber) {
  await page.type('input#sign-in-phone-number', phoneNumber);
  await page.waitForTimeout(1000)
  await page.keyboard.press('Enter');
}

async function enterCodeNumber(page, codeNumber) {
  await page.waitForSelector('input#sign-in-code');
  await page.type('input#sign-in-code', codeNumber);
}

async function enterPassword(page, password) {
  await page.waitForSelector('input#sign-in-password');
  await page.type('input#sign-in-password', password);
  await page.waitForTimeout(1000)
  await page.keyboard.press('Enter');
}

async function enterInSearch(page, channelName) {
  await page.waitForSelector('input#telegram-search-input');
  await slowType(page, 'input#telegram-search-input', channelName, 100);
}

async function selectGroup(page) {
  await page.waitForTimeout(3000);
  await page.waitForSelector('div.search-section');
  const searchSections = await page.$$('div.search-section');
  
  await page.waitForTimeout(2000)
  console.log(searchSections.length)
  for (const searchSection of searchSections) {
    const headingElement = await searchSection.$('h3.section-heading');
    if (headingElement) {
      const headingText = await headingElement.evaluate(
        element => element.innerText
      );
      console.log(headingText);
      if (headingText.includes('Global Search')) {
        const allChanelName = await searchSection.$$('span.handle');
        for (let i = 0; i < allChanelName.length; i++) {
          const chanelName = await allChanelName[i].evaluate(
            element => element.textContent
          );
          console.log(chanelName);
        }
        
        // if (allChanelName.length === 1) {
          // searchSection.click('span.handle');
          allChanelName[0].click()
        // }
      } else if (headingText.includes('Chats and Contacts')) {

      }
    }
  }
}

async function writeMessageUser(page, message, phone, db) {
  await page.waitForTimeout(2000);
  await page.waitForSelector('div#editable-message-text');
  await slowType(page, 'div#editable-message-text', message, 100);
  await page.keyboard.press('Enter');
}

async function writeMessage(page, text) {
  await page.waitForTimeout(5000);
  await page.waitForSelector('div#editable-message-text');
  await slowType(page, 'div#editable-message-text', text, 100);
  await page.keyboard.press('Enter');
}

async function slowType(page, selector, text, delay) {
  await page.waitForSelector(selector);
  const inputElement = await page.$(selector);
  await selectAllAndDelete(page);
  if (inputElement) {
    for (const char of text) {
      await inputElement.type(char, { delay: delay });
    }
  }
}


async function clickBackButtonUser(page) {
  await page.waitForTimeout(1000);
  await page.waitForSelector('div.back-button');
  const divBack = await page.$$('div.back-button');
  const buttonBack = await divBack[1].$('button');
  await buttonBack.click();
}

async function clickBackButton(page) {
  await page.waitForTimeout(1000);
  await page.waitForSelector('div.back-button');
  const divBack = await page.$('div.back-button');
  const buttonBack = await divBack.$('button');
  await buttonBack.click();
}