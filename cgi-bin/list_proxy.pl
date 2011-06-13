#!/usr/bin/perl

use strict;
use Webservice::InterMine;
use CGI;

my $url = 'http://yeastmine-test.yeastgenome.org/yeastmine-dev/';
my $user = 'ciscohitz@gmail.com';
my $pass = 'hairball';

my $q = CGI->new;
my $type = $q->param("type");
my @list = $q->param("list");

my $server = Webservice::InterMine->get_service($url, $user, $pass);
my $created = $server->new_list(type=>$type, content=> \@list);

my ($name, $rest) = split(/\s+/,"$created");
my $tmp = join(" ",@list);
print $q->header('text/xml');
print <<EOF
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<list_data>
 <input>$tmp</input>
 <response>$created</response>
</list_data>
EOF


