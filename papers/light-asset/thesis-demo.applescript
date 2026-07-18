-- Demo script for Thesis Master
-- Opens Safari, navigates through the app flow

tell application "Safari"
    activate
    delay 1
    
    -- Open login page
    set URL of front document to "http://localhost:3000/login"
    delay 2
    
    -- Switch to Register tab (click "注册" button)
    do JavaScript "document.querySelectorAll('button')[2].click()" in front document
    delay 1
    
    -- Fill in form fields
    do JavaScript "
        var inputs = document.querySelectorAll('input');
        inputs[0].value = 'Demo User';
        inputs[0].dispatchEvent(new Event('input', {bubbles:true}));
        inputs[1].value = 'demo@example.com';
        inputs[1].dispatchEvent(new Event('input', {bubbles:true}));
        inputs[2].value = '123456';
        inputs[2].dispatchEvent(new Event('input', {bubbles:true}));
    " in front document
    delay 1
    
    -- Click submit button
    do JavaScript "document.querySelector('button[type=submit]').click()" in front document
    delay 3
    
    -- Now on Dashboard - click "新建论文"
    do JavaScript "
        var btns = document.querySelectorAll('button');
        for (var i=0; i<btns.length; i++) {
            if (btns[i].textContent.includes('新建论文') || btns[i].textContent.includes('开始写作')) {
                btns[i].click();
                break;
            }
        }
    " in front document
    delay 3
    
    -- Now on Workspace - type a message
    do JavaScript "
        var input = document.querySelector('input[type=text]');
        if (input) {
            input.value = '请帮我写文献综述的大纲';
            input.dispatchEvent(new Event('input', {bubbles:true}));
            var ke = new KeyboardEvent('keydown', {key:'Enter', code:'Enter', keyCode:13, which:13, bubbles:true});
            input.dispatchEvent(ke);
        }
    " in front document
    delay 4
end tell

return "done"
