# Translator

A Counterpart inspired translation lib. Counterpart is great, but didn't do things
quite how I wanted. Changing them in counterpart would have broken backwards-compatibility
massively. So this is my opinionated version.

For example, counterpart creates a global singleton. Not good - I don't like singletons.
It's probably OK in browser, but outside, not so good.

Also I don't provide nearly as much functionality, mainly because a lot of counterpart's
friendly functionality is allowing user error. For example, if you provide a key: `x..y.z`,
it treats it as `x.y.z` which in my opinion is a bug not a feature.

## Main differences to counterpart.

 - No global singleton, you must instantiate it.
 - Allows dot-delimited or array paths but not mixed, but `x..y.z` is valid (just as `obj[""]` is a valid property).
    mixing is disallowed to allow dots in keys if you wish, without having to change the seperator.
 - No changing seperator.
 - No default interpolations, say what you mean.
 - Seperation of interpolations from options, e.g. you call `translate(key, [options])(interpolations)`. Without interpolation you can just call `translate(key, [options])()` or even just cast to string... `el.innerHTML = "<span>" + translate(key, [options]) + "</span>";`
 - Error is thrown on `missing translation/locale` by default, unless `doNotThrow: true` in options.
 - No default locale, you must set it in contructor.
 - No autoloading translations/locales.
 - Provides auto-fallback for similiar locales, ie. `en_US` will fallback to `en` if string not found.