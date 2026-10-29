<?php
declare(strict_types=1);
namespace App;

use MongoDB\Client;
use MongoDB\Database;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

final class Db {
    private static ?Database $db = null;
    public static function db(): Database {
        if (!self::$db) {
            $client = new Client(Env::get('MONGO_URI', 'mongodb://127.0.0.1:27017'));
            self::$db = $client->selectDatabase(Env::get('MONGO_DB', 'sindbad'));
        }
        return self::$db;
    }
    public static function col(string $name) { return self::db()->selectCollection($name); }
    public static function oid(string $id): ?ObjectId {
        return preg_match('/^[a-f0-9]{24}$/i', $id) ? new ObjectId($id) : null;
    }
    public static function now(): UTCDateTime { return new UTCDateTime(); }
    /** Convert BSON documents into plain JSON-safe arrays. */
    public static function ser(mixed $v): mixed {
        if ($v instanceof ObjectId) return (string)$v;
        if ($v instanceof UTCDateTime) return $v->toDateTime()->format(DATE_ATOM);
        if ($v instanceof \MongoDB\Model\BSONDocument || $v instanceof \MongoDB\Model\BSONArray) $v = $v->getArrayCopy();
        if (is_array($v)) {
            $out = [];
            foreach ($v as $k => $x) $out[$k === '_id' ? 'id' : $k] = self::ser($x);
            return $out;
        }
        return $v;
    }
}
