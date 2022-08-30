function Validator(formSelector, options) {

    // ES5: Assign value default for parameter options when define
    if (!options) {
        options = {};
    }

     function getParent (element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
     }

    var formRules = {}
    /* 
    Convention create rule:
        - if false then return `error message`
        - if true then return `undefined`
     */
    var validatorRules = {
        required: function (value) {
            return value ? undefined : `Vui lòng nhập trường này`
        }, 
        email: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : `Vui lòng nhập email`
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`
            }
        },
        max: function (max) {
            return function (value) {
                return value.length <= max ? undefined : `Vui lòng nhập tối đa ${min} kí tự`
            }
        },
        confirm: function (value) {
                return value === document.querySelector('#password').value ? undefined : 'Mật khẩu nhập lại không chính xác'                
            }
        }

    // Get form element in DOM by `formSelector`
    var formElement = document.querySelector(formSelector)
    // Just handle when formElement is getted by DOM
    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]')
        for (var input of inputs) {
            var rules = input.getAttribute('rules').split('|')
            for (var rule of rules) {
                var ruleInfo;
                var isRuleHasValue = rule.includes(':')

                if (isRuleHasValue) {
                    ruleInfo = rule.split(':')
                    rule = ruleInfo[0]
                }

                // This is rule function
                var ruleFunc = validatorRules[rule]

                if (isRuleHasValue) {
                    // return function insinde min 
                    ruleFunc = ruleFunc(ruleInfo[1])
                }
                
                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)
                } else {
                    formRules[input.name] = [ruleFunc]

                }
            }
            // Listen event to validate (blue, change,...)
            input.onblur = handleValidate
            input.oninput = handleClearError
        }

        // Function do validate
        function handleValidate(event) {
            var rules = formRules[event.target.name]
            for (var rule of rules) {
                var errorMessage;
                if(errorMessage = rule(event.target.value)){
                    break
                } 
            }
            
            // If have a error message then render message to UI
            if (errorMessage) {
                var formGroup = getParent(event.target, '.form-group')
                if (formGroup) {
                    formGroup.classList.add('invalid')
                    var formMessage = formGroup.querySelector('.form-message')
                    if (formMessage) {
                        formMessage.innerText = errorMessage
                    }
                }
            }
            return !errorMessage
        }

        //  Function clear error message
        function handleClearError(event) {
            var formGroup = getParent(event.target, '.form-group')
            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid')
                var formMessage = formGroup.querySelector('.form-message')
                    if (formMessage) {
                        formMessage.innerText = ''
                    }
            }


        }

        // Handle behavior when submit form
        formElement.onsubmit = function(event) {
            event.preventDefault()

            var inputs = formElement.querySelectorAll('[name][rules]')
            var isValid = true
            for (var input of inputs){
                if(!handleValidate({target: input})){
                    isValid = false
                }
                
            }

            // When no error then submit form
            if (isValid) {
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        switch (input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                break
                            case 'checkbox':
                                if(!input.matches(':checked')){
                                    values[input.name] = ''
                                    return values
                                }

                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }

                                values[input.name].push(input.value)
                                break;
                            case 'file':
                                values[input.name] = input.files
                                break
                            
                            default:
                                values[input.name] = input.value
                                break;
                        }
                        return values
                    }, {})
                    // Callback function onSubmit and return values of input tag of the form
                    options.onSubmit(formValues)
                }
                else{
                    formElement.submit()
                }
            }
        }

        // console.log(formRules)

    }
}