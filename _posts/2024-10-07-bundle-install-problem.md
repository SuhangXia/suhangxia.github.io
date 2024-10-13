---
layout: post
title: A way to deal with bundle install getting stuck
date: 2024-10-07 00:23:13
description: This is what included tabs in a post could look like
tags: formatting code
categories: sample-posts
tabs: true
featured: true
authors:
  - name: Suhang Xia
_styles: >
  .fake-img {
    background: #bbb;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 0px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 12px;
  }
  .fake-img p {
    font-family: monospace;
    color: white;
    text-align: left;
    margin: 12px 0;
    text-align: center;
    font-size: 16px;
  }
---



如果``bundle install `` 卡住不动

可以运行

````terminal
$ bundle config 'mirror.https://rubygems.org' 'https://gems.ruby-china.com'
````

If running `bundle install` gets stuck within mainland China, you can run:

```terminal
$ bundle config 'mirror.https://rubygems.org' 'https://gems.ruby-china.com'
```
