var assert = require('assert');
global.ModelInterface = require('../kernel/interfaces/ModelInterface');
const InRamInterface = require('../kernel/interfaces/InRamInterface');
const Model = require('../kernel/model/Model');

describe('Model and migrations with db', function () {
    //In ram database interface
    const inRamInterface = new InRamInterface({
        cacheWhereEnable: true,
        data: [
            {testColumn_second: 'test'}
        ]
    });

    //Model
    class testModel extends Model {}
    m = new testModel(inRamInterface);

    //Migration
    describe('Model', function() {
        describe('Default data', function() {
            it('Data by default', function(){
                assert.strictEqual(m.all().length, 1);
            });
            it('Truncate table', function() {
                m.getInterface().clear();
                assert.strictEqual(m.all().length, 0);
            });
        });

        describe('Insert', function() {
            it('Should return new count of elements == 1', function() {
                m.insert({testColumn_first: 'enable', testColumn_second: 'testMe'});
                assert.strictEqual(m.all().length, 1);
            });
    
            it('Should return new count of elements == 100', function() {
                for(let i = 0; i < 99; i++) {
                    m.insert({testColumn_first: 'disable', testColumn_second: 'testMe'});                
                }

                assert.strictEqual(m.all().length, 100);
            });
        });

        describe('Where', function() {
            it('Should find elements count == 1', function() {
                assert.strictEqual(m.where([['testColumn_first', `enable`]]).length, 1);
            });
            it('Should find elements count == 1', function() {
                assert.strictEqual(m.where([['testColumn_first', '=', `enable`]]).length, 1);
            });
            it('Should find elements count == 5', function() {
                assert.strictEqual(m.where([['id', '>=', 1], ['id', '<=', 5]]).length, 5);
            });
        });

        describe('Get', function() {
            it('Element id should be 5', function() {
                assert.strictEqual(m.get(5).id, 5);
            });
        });

    });
});